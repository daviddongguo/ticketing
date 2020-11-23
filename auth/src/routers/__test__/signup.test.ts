import request from 'supertest';
import {app} from '../../app';

it('returns a 201 on successful signup', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'test',
		})
		.expect(201);
});
it('sets a cookie after successful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'test',
    });
  expect(response.get('Set-Cookie')).toBeDefined();
});
it('returns a 400, disallows duplicate emails', async () => {
	await request(app).post('/api/users/signup').send({
		email: 'test@test.com',
		password: 'test',
	});
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'test',
		})
		.expect(400);
});
it('returns a 400 with an invalid email', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test',
			password: 'test',
		})
		.expect(400);
});
it('returns a 400 with an invalid password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '         ',
		})
		.expect(400);
});

it('returns a 400 with missing email and password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
      email: 'test@test.com'
		})
		.expect(400);
	await request(app)
		.post('/api/users/signup')
		.send({
      password: 'test@test.com'
		})
		.expect(400);
});
