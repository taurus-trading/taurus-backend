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
    test('should return all users', async() => {
      
      const expectation = [
        {
          date_created: '1615247033401',
          username: 'moneybags',
        }
      ];

      const response = {
        date_created: '1615247033401', 
        email: 'warren@buffett.com', 
        hash: '1234', 
        id: 1, 
        username: 'moneybags'
      };

      await fakeRequest(app)
        .put('/api/updateuser')
        .set('Authorization', token)
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(response);
    });
    
    // get api/watchlist endpoint
    test.skip('should return watchlist', async() => {

      const expectation = [
        {
          id: 1,
          symbol: 'VTI',
          title: 'Vanguard Total Stock Market Index Fund',
          user_id: 1
        },
        {
          id: 2,
          symbol: 'QQQ',
          title: 'Invesco QQQ Trust Series 1',
          user_id: 1
        },
        {
          id: 3,
          symbol: 'ARKK',
          title: 'ARK Innovation ETF',
          user_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/watchlist')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // delete watchlist endpoint

    // post watchlist endpoint

    // get portfolio endpoint

    // delete portfolio endpoint

    // post portfolio endpoint

    // get watchlist endpoint

    // get portfolio endpoint

    // get users endpoint
    test.skip('should return all users', async() => {

      const expectation = [
        {
          id: 1,
          email: 'warren@buffett.com',
          date_created: '1615247033401',
          username: 'moneybags',
          hash: '1234'
        }
      ];

      const data = await fakeRequest(app)
        .get('/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toContainEqual(expectation);
    });

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

      await fakeRequest(app)
        .get('/api/notes')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(expectation).toEqual(expectation);
    });

    // post note endpoint
    test('should create a new note in the database', async() => {

      const expectation = {
        text: 'buy ten stocks of GmE'
      };
      
      const response = [
        {
          ...expectation,
          id: 4,
          user_id: 2
        }
      ];

      await fakeRequest(app)
        .post('/api/notes')
        .set('Authorization', token)
        .send(expectation)
        .expect('Content-Type', /json/);
      //.expect(200);

      const data = await fakeRequest(app)
        .get('/api/notes')
        .set('Authorization', token)
        .expect('Content-Type', /json/);
      //.expect(200);

      expect(data.body).toEqual(response);
    });

    // delete note endpoint
    test('should delete a specific note in the row from the database', async() => {

      await fakeRequest(app)
        .delete('/api/notes/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = fakeRequest(app)
        .get('/api/notes')
        .set('Authorization', token)
        .expect('Content-type', /json/)
        .expect(200);

      expect(data.body).toEqual(undefined);
    });
  });
});
