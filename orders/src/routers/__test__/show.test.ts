import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';

const baseUrl = '/api/orders';

const randomId = mongoose.Types.ObjectId().toHexString();
let orderId = 'intial-orderId';

beforeEach(async () => {
	const response = await request(app)
		.post(baseUrl + `/${global.ticketId}`)
		.set('Cookie', global.cookie)
		.send({})
		.expect(201);
	orderId = response.body.id;
});

it(`retrieves one order to ${baseUrl}/orderId for get requests`, async () => {
	const response = await request(app)
		.get(baseUrl + `/${orderId}`)
		.set('Cookie', global.cookie);
	expect(response.status).toEqual(200);
	expect(response.body.orders.length).toEqual(1);
	expect(response.body.orders[0].id).toEqual(orderId);
	expect(response.body.orders[0].userId).toEqual(global.userId);
	expect(response.body.orders[0].ticketId).toEqual(global.ticketId);
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
