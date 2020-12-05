import request from 'supertest';
import {app} from '../../app';

const baseUrl = '/api/orders';
let orderId = 'orderId';

beforeEach(async () => {
	const response = await request(app)
		.post(baseUrl)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId})
		.expect(201);
	orderId = response.body.id;
	await request(app)
		.post(baseUrl)
		.set('Cookie', global.cookie)
		.send({ticketId: global.secondTicketId})
		.expect(201);
});

it(`has a route handler listening to ${baseUrl} for get requests`, async () => {
	const response = await request(app).get(baseUrl).set('Cookie', global.cookie);
	expect(response.status).not.toEqual(404);
});

it(`retrieves a list of orders to ${baseUrl} for get requests`, async () => {
	const response = await request(app).get(baseUrl).set('Cookie', global.cookie);
	expect(response.status).toEqual(200);
  expect(response.body.orders.length).toEqual(2);
  expect(response.body.orders[0].ticket.id).toEqual(global.ticketId);
  expect(response.body.orders[1].ticket.id).toEqual(global.secondTicketId);
});


