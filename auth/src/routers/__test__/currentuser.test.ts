import request from 'supertest';
import {app} from '../../app';

it('responds with details about the current user', async () => {
  const emailStr = 'test@email.com';
	const authResponse = await request(app)
		.post('/api/users/signup')
		.send({
			email: emailStr,
			password: 'test',
		})
		.expect(201);

	const cookie = authResponse.get('Set-Cookie');

	const response = await request(app)
		.get('/api/users/currentuser')
		.set('Cookie', cookie)
		.expect(200);
  console.table(response.body);
  expect(response.body.currentUser.email).toEqual(emailStr);
});
