const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    date_created DATE NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE watchlist (
                    id SERIAL PRIMARY KEY NOT NULL,
                    symbol VARCHAR(512) NOT NULL,
                    title VARCHAR(512) NOT NULL,
                    current_price DECIMAL(8,2) NOT NULL,
                    user_id INTEGER NOT NULL REFERENCES users(id)
            );
                CREATE TABLE portfolio (
                  user_id INTEGER NOT NULL REFERENCES users(id),
                  id SERIAL PRIMARY KEY NOT NULL,
                  symbol VARCHAR(512) NOT NULL,
                  title VARCHAR(512) NOT NULL,
                  date_purchased DATE NOT NULL,
                  cost DECIMAL(8,2) NOT NULL,
                  quantity INTEGER NOT NULL,
                  current_price DECIMAL(8,2) NOT NULL
            );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
