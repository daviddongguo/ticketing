import request from 'supertest';
import {app} from '../../app';

const email = 'test@email.com';
const password = 'test';
it('returns 201 on successful signup', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password,
		})
		.expect(201);
});
it('sets a cookie after successful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password,
    });
  expect(response.get('Set-Cookie')).toBeDefined();
});
it('returns 400, disallows duplicate emails', async () => {
	await request(app).post('/api/users/signup').send({
		email,
		password,
	});
	await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password,
		})
		.expect(400);
});
it('returns 400 with an invalid email', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test',
			password,
		})
		.expect(400);
});
it('returns 400 with an invalid password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password: '         ',
		})
		.expect(400);
});
it('returns 400 with missing email and password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
      email
		})
		.expect(400);
	await request(app)
		.post('/api/users/signup')
		.send({
      password
		})
		.expect(400);
});
