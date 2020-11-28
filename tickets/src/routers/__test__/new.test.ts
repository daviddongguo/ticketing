import request from 'supertest';
import {app} from '../../app';

const url = '/api/tickets';
const email = 'test@test.com';
const password = 'test';
it('has a route handler listening to /api/tickets for post requests', async ()=>{
  const response = await request(app).post(url).send({});
  expect(response.status).not.toEqual(404);
  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in.', async ()=>{
  const cookie = await global.signin(email);
  const response = await  request(app).post(url).set('Cookie', cookie).send({});
  expect(response.status).not.toEqual(401);
});

it('2 returns a status other than 401 if the user is signed in.', async ()=>{
  // await request(app).post('/api/users/signout').send({});
  const cookie = await global.signup(email);
  const response = await  request(app).post(url).set('Cookie', cookie).send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async ()=>{});

it('returns an error if an invalid price is provide.', async ()=>{});

it('creates a ticket with valid inputs', async ()=>{});
