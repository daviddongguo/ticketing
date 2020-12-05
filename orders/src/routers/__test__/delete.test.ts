import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';

const baseUrl = '/api/orders';

const randomId = mongoose.Types.ObjectId().toHexString();

it(`deletes one order to ${baseUrl}/orderId for delete requests`, async () => {
  const ticket = await global.createTicket();
  const orderId =(await global.createOrder(ticket, global.userId)).id;
  const response = await request(app)
		.delete(baseUrl + `/${orderId}`)
		.set('Cookie', global.cookie);
  expect(response.status).toEqual(204);
  const orders = await Order.find();
  expect(orders.length).toEqual(0);

});

it('returns a  401 if the user does not own the order', async () => {
  const ticket = await global.createTicket();
  const orderId =(await global.createOrder(ticket, global.userId)).id;
	await request(app)
		.delete(baseUrl + `/${orderId}`)
		.set('Cookie', global.secondCookie)
		.expect(401);
});

it('returns a  404 if the order is not found', async () => {
	await request(app)
		.delete(baseUrl + '/' + randomId)
		.set('Cookie', global.cookie)
		.expect(404);
});

it('returns a  400 if the orderId is not valid', async () => {
	await request(app)
		.delete(baseUrl + '/notvalidId53cb6b9b')
		.set('Cookie', global.cookie)
		.expect(400);
});


