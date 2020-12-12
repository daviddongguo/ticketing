
import request from 'supertest';
import {app} from '../../app';

it('Returns 404 statusCode to /no-existed-router', async ()=>{
  const response = await request(app).post('/api/users/no-existed-router').send({});

  expect(response.status).toEqual(404);
});

it('Returns 200 statusCode and a message to /api/users/test', async ()=>{
  const response = await request(app).get('/api/users/test');
  expect(response.status).toEqual(200);
  // console.table(response.body);
  expect(response.body).not.toBeNull();
  expect(response.body.message).toContain('Hi, there!');
});
