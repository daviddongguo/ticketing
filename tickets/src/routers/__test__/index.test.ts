import request from 'supertest';
import {app} from '../../app';

const baseUrl = '/api/tickets';
const title = 'it is a title';
const price: number = 1.99;
let ticketId = 'ticketId';

beforeEach(async () => {
	const response = await request(app)
		.post(baseUrl)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(201);
	ticketId = response.body.id;
	await request(app)
		.post(baseUrl)
		.set('Cookie', global.cookie)
		.send({title: title + ', second', price})
		.expect(201);
});

it(`has a route handler listening to ${baseUrl} for get requests`, async () => {
	const response = await request(app).get(baseUrl);
	expect(response.status).not.toEqual(404);
});

it(`retrieves a list of tickets to ${baseUrl} for get requests`, async () => {
	const response = await request(app).get(baseUrl);
	expect(response.status).toEqual(200);
	expect(response.body.tickets.length).toEqual(2);
});


