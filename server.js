const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create "exchange_orders" table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS exchange_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_type TEXT,
    exchange_rate REAL,
    amount_ebucks REAL,
    location TEXT
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

  // Insert the relevant data into the exchange_orders table
  db.run(
    `INSERT INTO exchange_orders (order_type, exchange_rate, amount_ebucks, location) VALUES (?, ?, ?, ?)`,
    [orderType, exchangeRate, ebucks, location],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Failed to insert order into database.' });
      } else {
        res.status(200).send({ success: 'Order successfully saved.' });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
