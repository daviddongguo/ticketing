import request from 'supertest';
import {app} from '../../app';

it('returns 2000 with successful login', async () => {
	await request(app).post('/api/users/signup').send({
		email: 'test@test.email',
		password: 'test',
	});
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.email',
			password: 'test',
		})
		.expect(200);
});
it('sets ', async () => {
	await request(app).post('/api/users/signup').send({
		email: 'test@test.email',
		password: 'test',
	});
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.email',
			password: 'test',
		})
		.expect(200);
});
