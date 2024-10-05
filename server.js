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
        // Fetch all orders from the database to find the best match
        db.all(`SELECT * FROM exchange_orders`, (err, orders) => {
          if (err) {
            console.error(err.message);
            res.status(500).send({ error: 'Failed to retrieve orders.' });
            return;
          }

          // Use the findBestExchange function to find the best match from the last 30 minutes
          const currentTime = Date.now();
          const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
          const recentOrders = orders.filter(order => order.timestamp >= thirtyMinutesAgo);

          const bestMatch = findBestExchange(recentOrders);

          // Send the best match back to the front end
          if (bestMatch) {
            res.status(200).send({ success: true, bestMatch });
          } else {
            res.status(200).send({ success: true, message: 'No suitable match found.' });
          }
        });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
