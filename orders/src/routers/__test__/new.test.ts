import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';
import {natsWrapper} from './../../nats-wrapper';

const url = '/api/orders';
const randomId = mongoose.Types.ObjectId().toHexString();

it('has a route handler listening to /api/orders for post requests', async () => {
	const response = await request(app)
		.post(url)
		.send({ticketId: global.ticketId});
	expect(response.status).not.toEqual(404);
	expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in.', async () => {
	const response = await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId});

	expect(response.status).not.toEqual(401);
});

it('returns a  400 if the ticketId is not valid', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: 'invalidticketeid'})
		.expect(400);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: '                     '})
		.expect(400);
});

it('returns an error if the ticket does not exist', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: randomId})
		.expect(404);
});

it('returns an error if the order is already reserved', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId})
		.expect(201);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId})
		.expect(400);
});

it('creates a order with valid inputs', async () => {
	let orders = await Order.find({});
	expect(orders.length).toEqual(0);

	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId})
		.expect(201);
	orders = await Order.find({});
	console.log(orders[0]);
	expect(orders.length).toEqual(1);
	expect(orders[0].userId).toEqual(global.userId);
	expect(orders[0].ticket.toString()).toEqual(global.ticketId);
});

it('emits an order created event', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId})
		.expect(201);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it.todo('throw an database connection error');
