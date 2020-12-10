import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';

const url = '/api/payments';
const userId = mongoose.Types.ObjectId().toHexString();
const cookie = global.signup(userId);
const buildOrder = () => {
	return Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version: 0,
		userId,
		price: 1.91,
	});
};

it('returns success', async () => {
	const order = await buildOrder().save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token: 'tok_mastercard',
	});
	expect(response.status).toEqual(201);
});

it('returns a 404 when purchasing an order that does not exits', async () => {
	// await order.save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: mongoose.Types.ObjectId().toHexString(),
		token: 'tok_mastercard',
	});
	expect(response.status).toEqual(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
	const order = await buildOrder().save();
	const response = await request(app)
		.post(url)
		.set('Cookie', global.signin()) // new user created
		.send({
			orderId: order.id,
			token: 'tok_mastercard',
		});
	expect(response.status).toEqual(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
	const order = await buildOrder().save();
	order.status = OrderStatus.Cancelled; // order cancelled
	await order.save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token: 'tok_mastercard',
	});
	expect(response.status).toEqual(400);
});
