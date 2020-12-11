import request from 'supertest';
import {app} from '../../app';

it('Route to no-existed-router', async ()=>{
  const response = await request(app).post('/api/users/no-existed-router').send({});

  expect(response.status).toEqual(404);
});

it('Route to api/users/test', async ()=>{
  const response = await request(app).get('/api/users/test');

  expect(response.status).toEqual(200);
  expect(response.body).not.toBeNull();
  expect(response.body.message).toContain('Hi, there!');
});
