import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';
import {natsWrapper} from './../../nats-wrapper';

const id = mongoose.Types.ObjectId().toHexString();
const status = 'paid';
const url = '/api/orders'
let orderId = 'intial-id';

beforeEach(async () => {
	const response = await request(app)
		.post(`/api/orders`)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId});
  orderId = response.body.id;
	console.log(`Created a order (id = ${orderId} status = ${response.body.status})`);
});

it('has a right route handler listening to but the user is not authenticated', async () => {
	const response = await request(app)
		.put(url + `/${orderId}`)
		.send({status});
	expect(response.status).not.toEqual(404);
	expect(response.status).toEqual(401);
});

it('Returns 401 if the user does not own the order', async () => {

	await request(app)
		.put(url + `/${orderId}`)
		.set('Cookie', global.secondCookie)
		.send({status})
		.expect(401);
});

it('returns a status other than 401 if the user is authenticated', async () => {
	const response = await request(app)
		.put(url + `/${orderId}`)
		.set('Cookie', global.cookie)
		.send({status});
	expect(response.status).not.toEqual(401);
});


it('Updates a order with valid inputs', async () => {
	await request(app)
		.put(url + `/${orderId}`)
		.set('Cookie', global.cookie)
		.send({status})
		.expect(204);
	const orders = await Order.find({});
	expect(orders.length).toEqual(1);
	expect(orders[0].status).toEqual(status);
	expect(orders[0].userId).toEqual(global.userId);
	expect(orders[0].ticketId).toEqual(global.ticketId);
});


it('Publish an event', async () => {
	await request(app)
		.put(url + `/${orderId}`)
		.set('Cookie', global.cookie)
		.send({status})
		.expect(204);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Returns 400 if the provided id is invalid.', async () => {
	await request(app)
		.put(url + '/invalidId')
		.set('Cookie', global.secondCookie)
		.send({status})
		.expect(400);
});

it('Returns 404 if the provided id does not exist', async () => {
	await request(app)
		.put(url + `/${id}`)
		.set('Cookie', global.secondCookie)
		.send({status})
		.expect(404);
});
