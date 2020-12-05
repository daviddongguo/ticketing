import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';
import {natsWrapper} from './../../nats-wrapper';

const url = '/api/orders';

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
	expect(orders.length).toEqual(1);
	expect(orders[0].userId).toEqual(global.userId);
	expect(orders[0].ticketId).toEqual(global.ticketId);
});

it('publishes an event', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({ticketId: global.ticketId})
		.expect(201);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
