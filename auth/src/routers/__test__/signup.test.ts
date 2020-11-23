import request from 'supertest';
import {app} from '../../app';

it('returns a 201 on successful signup', async()=>{
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'test'
  })
  .expect(201);
});
it('returns a 400 on failed signup', async()=>{
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'test',
    password: 'test'
  })
  .expect(400);
});
it('returns a 400 on failed password', async()=>{
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: '         '
  })
  .expect(400);
});
