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
app.put('/api/updateuser', async(req, res) => {
  try {
    const data = await client.query(`
    UPDATE users
    SET username = $1, date_created = $2
    WHERE id=$3
    RETURNING *;
`,
    [req.body.username, req.body.date_created, req.userId]);

    res.json(data.rows);

  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});
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
    INSERT INTO watchlist (symbol, title, user_id)
    VALUES ($1, $2, $3)
    RETURNING *;
`,
    [req.body.symbol, req.body.title, req.userId]);
    
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


app.get('/twits', async(req, res) => {
  try {
    const symbol = req.query.symbol;
    const data = await request.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/currentprice', async(req, res) => {
  try {
    const search = req.query.search;
    const data = await request.get(`https://finnhub.io/api/v1/quote?symbol=${search}&token=${process.env.FINNHUB_KEY}`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/search', async(req, res) => {
  try {
    const search = req.query.search;
    const data = await request.get(`https://finnhub.io/api/v1/search?q=${search}&token=${process.env.FINNHUB_KEY}`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/pricehistory', async(req, res) => {
  try {
    const symbol = req.query.symbol;
    const resolution = req.query.resolution;
    const to = req.query.to;
    const from = req.query.from;
    const data = await request.get(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${process.env.FINNHUB_KEY}`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/notes', async(req, res) => {
  try {

    const data = await client.query(`
      SELECT *
      FROM notes
      ORDER BY id DESC
      WHERE user_id=$1;
    `, [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/notes', async(req, res) => {
  try {

    const data = await client.query(`
      INSERT INTO notes (text, user_id)
      values ($1, $2)
      RETURNING *;
    `, [req.body.text, req.userId]);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/watchlist/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from notes WHERE user_id=$1 and id=$2', [req.userId, req.params.id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
