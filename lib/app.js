const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/watchlist', async(req, res) => {
  try {
    const data = await client.query('SELECT * from watchlist WHERE user_id=$1', [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/watchlist/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from watchlist WHERE user_id=$1 and id=$2', [req.userId, req.params.id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/watchlist/', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO watchlist (symbol, title, current_price, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
`,
    [req.body.symbol, req.body.title, req.body.current_price, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/portfolio', async(req, res) => {
  try {
    const data = await client.query('SELECT * from portfolio WHERE user_id=$1', [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/portfolio/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from portfolio WHERE user_id=$1 and id=$2', [req.userId, req.params.id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/portfolio/', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO portfolio (user_id, symbol, title, date_purchased, cost, quantity, current_price)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
`,
    [req.userId, req.body.symbol, req.body.title, req.body.date_purchased, req.body.cost, req.body.quantity, req.body.current_price]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/watchlist', async(req, res) => {
  try {
    const data = await client.query('SELECT * from watchlist');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/portfolio', async(req, res) => {
  try {
    const data = await client.query('SELECT * from portfolio');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/users', async(req, res) => {
  try {
    const data = await client.query('SELECT * from users');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/trending', async(req, res) => {
  try {
    const data = await request.get('https://api.stocktwits.com/api/2/trending/symbols.json');
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
