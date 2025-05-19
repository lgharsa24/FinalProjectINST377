const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

async function initializeTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      symbol TEXT UNIQUE,
      company_name TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id SERIAL PRIMARY KEY,
      symbol TEXT UNIQUE,
      company_name TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recent_searches (
      id SERIAL PRIMARY KEY,
      symbol TEXT,
      companyName TEXT,
      searched_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
initializeTables();

app.get('/', (req, res) => {
  res.send('EasyTrack Stocks API is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Quote endpoint
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    const quote = response.data["Global Quote"];
    if (quote && Object.keys(quote).length > 0) {
      res.json({
        symbol: quote["01. symbol"],
        price: quote["05. price"],
        change: quote["09. change"],
        changePercent: quote["10. change percent"],
        open: quote["02. open"],
        high: quote["03. high"],
        low: quote["04. low"],
        previousClose: quote["08. previous close"],
        volume: quote["06. volume"],
        latestTradingDay: quote["07. latest trading day"]
      });
    } else {
      res.status(404).json({ error: 'Stock not found or API limit reached.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quote.' });
  }
});

// History endpoint
app.get('/api/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    if (response.data && response.data["Time Series (Daily)"]) {
      res.json(response.data["Time Series (Daily)"]);
    } else {
      res.status(404).json({ error: 'History not found or API limit reached.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history.' });
  }
});

// Overview endpoint
app.get('/api/overview/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    if (response.data && response.data.Name) {
      res.json(response.data);
    } else {
      res.status(404).json({ error: 'Overview not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching overview.' });
  }
});

// Watchlist endpoints
app.get('/api/watchlist', async (req, res) => {
  try {
    const result = await pool.query("SELECT symbol, company_name FROM watchlist");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watchlist', async (req, res) => {
  const { symbol, companyName } = req.body;
  if (!symbol || !companyName) return res.status(400).json({ error: 'Symbol and companyName are required.' });
  try {
    await pool.query(
      "INSERT INTO watchlist (symbol, company_name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [symbol.toUpperCase(), companyName]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/watchlist/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    await pool.query("DELETE FROM watchlist WHERE symbol = $1", [symbol.toUpperCase()]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/portfolio', async (req, res) => {
  try {
    const result = await pool.query("SELECT symbol, company_name FROM portfolio");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  const { symbol, companyName } = req.body;
  if (!symbol || !companyName) return res.status(400).json({ error: 'Symbol and companyName are required.' });
  try {
    await pool.query(
      "INSERT INTO portfolio (symbol, company_name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [symbol.toUpperCase(), companyName]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    await pool.query("DELETE FROM portfolio WHERE symbol = $1", [symbol.toUpperCase()]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/recent-searches', async (req, res) => {
  const { symbol, companyName } = req.body;
  if (!symbol || !companyName) return res.status(400).json({ error: 'Symbol and companyName are required.' });
  try {
    await pool.query(
      "INSERT INTO recent_searches (symbol, companyName) VALUES ($1, $2)",
      [symbol.toUpperCase(), companyName]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recent-searches', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (symbol) symbol, companyName
       FROM recent_searches
       ORDER BY symbol, searched_at DESC
       LIMIT 5`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/portfolio/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { quantity } = req.body;
  try {
    await pool.query(
      "UPDATE portfolio SET quantity = $1 WHERE symbol = $2",
      [quantity, symbol.toUpperCase()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/api/symbolsearch/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching symbol search.' });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`EasyTrack Stocks backend running on port ${PORT}`);
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const result = await pool.query("SELECT symbol, company_name, quantity FROM portfolio");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
