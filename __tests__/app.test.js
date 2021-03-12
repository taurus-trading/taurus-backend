require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    // update user endpoint
    
    // get api/watchlist endpoint

    // delete watchlist endpoint

    // post watchlist endpoint

    // get portfolio endpoint

    // delete portfolio endpoint

    // post portfolio endpoint

    // get watchlist endpoint

    // get portfolio endpoint

    // get users endpoint
    test('should return all users', async() => {

      const expectation = [
        {
          id: 1,
          email: 'warren@buffett.com',
          date_created: 1615247033401,
          username: 'moneybags',
          hash: 1234
        },
        {
          id: 2,
          email: 'jon@user.com',
          username: null,
          date_created: null,
          hash: 1234
        }

      ];

      const data = await fakeRequest(app)
        .get('/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // get trending endpoint

    






    // get notes endpoint
    test('should return notes for a signed in user', async() => {

      const expectation = [
        {
          'id': 1,
          'text': 'buy ten shares of GME.',
          'user_id': 1
        },
        {
          'id': 1,
          'text': 'buy ten shares of TSLA.',
          'user_id': 1
        },
        {
          'id': 1,
          'text': 'buy ten shares of BTC.',
          'user_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/notes')
        .set('Authorization', token)
        .expect('Content-Type', /json/);
        //.expect(200)

      expect(data.body).toEqual([expectation]);
    });

    // post note endpoint
    test('should create a new note in the database', async() => {

      const expectation = [
        {
          'id': 1,
          'text': 'buy ten shares of GME.',
          'user_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/notes')
        .set('Authorization', token)
        .expect('Content-Type', /json/);
        //.expect(200)

      expect(data.body).toEqual(expectation);
    });

    // delete note endpoint
    test('should delete a specific note in the row from the database', async() => {

      const expectation = [
        {
          'id': 1,
          'text': 'buy ten shares of TSLA.',
          'user_id': 1
        },
        {
          'id': 1,
          'text': 'buy ten shares of BTC.',
          'user_id': 1
        }
      ];

      await fakeRequest(app)
        .delete('/api/notes/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/);
      //.expect(200)

      const data = fakeRequest(app)
        .get('/api/notes')
        .set('Authorization', token)
        .expect('Content-type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
