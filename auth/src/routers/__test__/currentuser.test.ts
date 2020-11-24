import request from 'supertest';
import {app} from '../../app';

it('responds with details about the current user', async () => {
  const emailStr = 'test@email.com';
	const cookie = await global.signup(emailStr);

	const response = await request(app)
		.get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
		.expect(200);
  console.table(response.body);
  expect(response.body.currentUser.email).toEqual(emailStr);
});
it('responds with null if not authenticated', async () => {

	const response = await request(app)
    .get('/api/users/currentuser')
    .send()
		.expect(200);
  console.table(response.body);
  expect(response.body.currentUser).toEqual(null);
});
