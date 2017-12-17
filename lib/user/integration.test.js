const faker = require('faker');
const request = require('supertest');
const app = require('../app');

const {Model: User} = require('./');

describe('user integration', () => {
  describe('POST /api/users', () => {
    describe('with invalid parameters', () => {
      it('should return a 422', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Accept', 'application/json')
          .send({user: {}});

        expect(response.statusCode).toBe(422);
        expect(response.body).toEqual({
          errors: {
            email: [`can't be blank`],
            password: [`can't be blank`],
            username: [`can't be blank`],
          },
        });
      });
    });

    describe('with valid parameters', () => {
      it('should return a 201', async () => {
        const email = faker.internet.email();
        const password = faker.internet.password(8);
        const username = faker.internet.userName();

        const response = await request(app)
          .post('/api/users')
          .set('Accept', 'application/json')
          .send({
            user: {
              email,
              password,
              username,
            },
          });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
          user: {
            bio: null,
            email,
            image: null,
            token: expect.any(String),
            username,
          },
        });
      });
    });
  });

  describe('POST /api/users/login', () => {
    describe('with invalid parameters', () => {
      it('should return a 422', async () => {
        const response = await request(app)
          .post('/api/users/login')
          .set('Accept', 'application/json')
          .send({user: {}});

        expect(response.statusCode).toBe(422);
        expect(response.body).toEqual({
          errors: {
            'email or password': ['is invalid'],
          },
        });
      });
    });

    describe('with valid parameters', () => {
      it('should return a 200', async () => {
        const email = faker.internet.email();
        const password = faker.internet.password(8);
        const username = faker.internet.userName();

        // Register a user first.
        await request(app)
          .post('/api/users')
          .set('Accept', 'application/json')
          .send({
            user: {
              email,
              password,
              username,
            },
          });

        const response = await request(app)
          .post('/api/users/login')
          .set('Accept', 'application/json')
          .send({
            user: {
              email,
              password,
            },
          });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          user: {
            bio: null,
            email,
            image: null,
            token: expect.any(String),
            username,
          },
        });
      });
    });
  });

  describe('GET /api/user', () => {
    describe('with invalid token', () => {
      it('should return a 401', async () => {
        const response = await request(app)
          .get('/api/user')
          .set('Accept', 'application/json')
          .set('Authorization', 'Token 123')
          .send();

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
          errors: {
            message: expect.any(String),
            error: expect.any(Object),
          },
        });
      });
    });

    describe('with valid token', () => {
      it('should return a 200', async () => {
        const email = faker.internet.email();
        const password = faker.internet.password(8);
        const username = faker.internet.userName();

        // Register a user first.
        const {body: {user: {token}}} = await request(app)
          .post('/api/users')
          .set('Accept', 'application/json')
          .send({
            user: {
              email,
              password,
              username,
            },
          });

        const response = await request(app)
          .get('/api/user')
          .set('Accept', 'application/json')
          .set('Authorization', `Token ${token}`)
          .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          user: {
            bio: null,
            email,
            image: null,
            token: expect.any(String),
            username,
          },
        });
      });
    });
  });

  describe('PUT /api/user', () => {
    let email;
    let password;
    let username;
    let token;

    beforeEach(async () => {
      email = faker.internet.email();
      password = faker.internet.password(8);
      username = faker.internet.userName();

      // Register a user first.
      ({body: {user: {token}}} = await request(app)
        .post('/api/users')
        .set('Accept', 'application/json')
        .send({
          user: {
            email,
            password,
            username,
          },
        }));
    });

    describe('with invalid token', () => {
      it('should return a 401', async () => {
        const response = await request(app)
          .put('/api/user')
          .set('Accept', 'application/json')
          .set('Authorization', 'Token 123')
          .send();

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
          errors: {
            message: expect.any(String),
            error: expect.any(Object),
          },
        });
      });
    });

    xdescribe('with invalid user id', () => {
      it('should return a 404', async () => {
      });
    });
  });
});