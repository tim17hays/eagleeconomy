const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const findBestExchange = require('./compareOrders');
const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create "exchange_orders" table if it doesn't exist, including a timestamp column
db.run(`
  CREATE TABLE IF NOT EXISTS exchange_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_type TEXT,
    exchange_rate REAL,
    amount_ebucks REAL,
    location TEXT,
    timestamp INTEGER
  )
`);

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

// Endpoint to get the 10 most recent orders
app.get('/recent-orders', (req, res) => {
  db.all(
    `SELECT * FROM exchange_orders ORDER BY timestamp DESC LIMIT 10`,
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Failed to retrieve recent orders.' });
      } else {
        res.status(200).send(rows);
      }
    }
  );
});

// Endpoint to handle form submissions
app.post('/submit-order', (req, res) => {
  const { orderType, usd, ebucks, location } = req.body;

  // Validate input
  if (!orderType || !location || isNaN(usd) || isNaN(ebucks) || ebucks === 0) {
    res.status(400).send({ error: 'Invalid input' });
    return;
  }

  // Calculate the exchange rate (price per Eagle Buck)
  const exchangeRate = parseFloat(usd) / parseFloat(ebucks);
  const timestamp = Date.now(); // Get the current time in milliseconds

  // Insert the relevant data into the exchange_orders table
  db.run(
    `INSERT INTO exchange_orders (order_type, exchange_rate, amount_ebucks, location, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [orderType, exchangeRate, ebucks, location, timestamp],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Failed to insert order into database.' });
      } else {
        const newOrderId = this.lastID;

        // Fetch the newly inserted order
        db.get(`SELECT * FROM exchange_orders WHERE id = ?`, [newOrderId], (err, newOrder) => {
          if (err) {
            console.error(err.message);
            res.status(500).send({ error: 'Failed to retrieve new order.' });
            return;
          }

          // Determine the type of counterpart orders to fetch
          const counterpartType = newOrder.order_type === 'buy' ? 'sell' : 'buy';

          // Fetch all counterpart orders (opposite type) from the last 30 minutes
          const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
          db.all(
            `SELECT * FROM exchange_orders WHERE order_type = ? AND id != ? AND timestamp >= ?`,
            [counterpartType, newOrderId, thirtyMinutesAgo],
            (err, counterpartOrders) => {
              if (err) {
                console.error(err.message);
                res.status(500).send({ error: 'Failed to retrieve counterpart orders.' });
                return;
              }

              // Use the findBestExchange function to find the best match for the new order
              const bestMatch = findBestExchange(newOrder, counterpartOrders);

              // Send the best match back to the front end
              if (bestMatch) {
                res.status(200).send({ success: true, bestMatch });
              } else {
                res.status(200).send({ success: true, message: 'No suitable match found for the new order.' });
              }
            }
          );
        });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
