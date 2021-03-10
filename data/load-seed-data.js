const client = require('../lib/client');
// import our seed data:
const stocks = require('./stocks.js');
const portfolioStocks = require('./portfolio.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const notes = require('./notes.js');
// const { port } = require('../lib/client');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, username, date_created, hash)
                      VALUES ($1, $2, $3, $4)
                      RETURNING *;
                  `,
        [user.email, user.username, user.date_created, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      stocks.map(stock => {
        return client.query(`
                    INSERT INTO watchlist (symbol, title, user_id)
                    VALUES ($1, $2, $3);
                `,
        [stock.symbol, stock.title, user.id]);
      })
    );

    await Promise.all(
      notes.map(note => {
        return client.query(`
                    INSERT INTO notes (text, user_id)
                    VALUES ($1, $2);
                `,
        [note.text, user.id]);
      })
    );

    await Promise.all(
      portfolioStocks.map(portfolioStock => {
        return client.query(`
                    INSERT INTO portfolio (user_id, symbol, title, date_purchased, cost, quantity, current_price)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [user.id, portfolioStock.symbol, portfolioStock.title, portfolioStock.date_purchased, portfolioStock.cost, portfolioStock.quantity, portfolioStock.current_price]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
