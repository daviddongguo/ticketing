import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';

const baseUrl = '/api/orders';

const randomId = mongoose.Types.ObjectId().toHexString();


it(`retrieves one order to ${baseUrl}/orderId for get requests`, async () => {
  const ticket = await global.createTicket();
  const orderId =(await global.createOrder(ticket, global.userId)).id;
	const response = await request(app)
		.get(baseUrl + `/${orderId}`)
		.set('Cookie', global.cookie);
	expect(response.status).toEqual(200);
	expect(response.body.orders.length).toEqual(1);
	expect(response.body.orders[0].id).toEqual(orderId);
	expect(response.body.orders[0].userId).toEqual(global.userId);
  expect(response.body.orders[0].ticket.id).toEqual(ticket.id);
});

it('returns a  401 if the user does not own the order', async () => {
  const ticket = await global.createTicket();
  const orderId =(await global.createOrder(ticket, global.userId)).id;
	await request(app)
		.get(baseUrl + `/${orderId}`)
		.set('Cookie', global.secondCookie)
		.expect(401);
});

it('returns a  404 if the order is not found', async () => {
	await request(app)
		.get(baseUrl + '/' + randomId)
		.set('Cookie', global.cookie)
		.expect(404);
});

it('returns a  400 if the orderId is not valid', async () => {
	await request(app)
		.get(baseUrl + '/notvalidId53cb6b9b')
		.set('Cookie', global.cookie)
		.expect(400);
});


