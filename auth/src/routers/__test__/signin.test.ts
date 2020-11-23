import request from 'supertest';
import {app} from '../../app';

beforeEach(async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.email',
			password: 'test',
		})
		.expect(201);
});

it('responds with a cookie when given valid credentials', async () => {
	const response = await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.email',
			password: 'test',
		})
		.expect(200);
	expect(response.get('Set-Cookie')).toBeDefined();
});
it('Not sets cookie after failed login', async () => {
	const response = await request(app).post('/api/users/signin').send({
		email: 'test@test.email',
		password: 'invalid',
	});
	expect(response.get('Set-Cookie')).not.toBeDefined();
});
it('fails when an incorrect password is supplied', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.email',
			password: 'invalid',
		})
		.expect(400);
});
it('fails when a email that does not exist is supplied.', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'testwrong@test.email',
			password: 'test',
		})
		.expect(400);
});
it('returns 400 with missing email or password', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.email',
		})
		.expect(400);
	await request(app)
		.post('/api/users/signin')
		.send({
			password: 'test',
		})
		.expect(400);
});
