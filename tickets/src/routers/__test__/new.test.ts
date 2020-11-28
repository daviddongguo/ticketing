import request from 'supertest';
import {app} from '../../app';

const url = '/api/tickets';
it('Returns 404 statusCode to /no-existed-router', async ()=>{
  const response = await request(app).post('/api/users/no-existed-router').send({});

  expect(response.status).toEqual(404);
});

it('Returns 200 statusCode and a message to /api/users/test', async ()=>{
  const response = await request(app).get('/api/users/test');
  expect(response.status).toEqual(200);
  console.table(response.body);
  expect(response.body).not.toBeNull();
  expect(response.body.message).toContain('Hi, there!');
});

it('has a route handler listening to /api/tickets for post requests', async ()=>{
  const response = await request(app).post(url).send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in.', async ()=>{});

it('returns an error if an invalid title is provided', async ()=>{});

it('returns an error if an invalid price is provide.', async ()=>{});

it('creates a ticket with valid inputs', async ()=>{});
