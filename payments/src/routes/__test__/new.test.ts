import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';
import {stripe} from '../../stripe';

jest.mock('../../stripe');  // not the real stripe

const url = '/api/payments';
const userId = mongoose.Types.ObjectId().toHexString();
const token= 'tok_mastercard';
const price = 1.99;
const cookie = global.signup(userId);
const orderBuild = () => {
	return Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version: 0,
		userId,
		price,
	});
};

it('returns success', async () => {
	const order = await orderBuild().save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token,
	});
  expect(response.status).toEqual(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual(token);
  expect(chargeOptions.amount).toEqual(price * 100);
  expect(chargeOptions.currency).toEqual('cad');
});
it('returns a 204 with valid inputs', async () => {
	const order = await orderBuild().save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token,
	});
	expect(response.status).toEqual(201);
});

it('returns a 404 when purchasing an order that does not exits', async () => {
	// await order.save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: mongoose.Types.ObjectId().toHexString(),
		token,
	});
	expect(response.status).toEqual(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
	const order = await orderBuild().save();
	const response = await request(app)
		.post(url)
		.set('Cookie', global.signin()) // new user created
		.send({
			orderId: order.id,
			token,
		});
	expect(response.status).toEqual(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
	const order = await orderBuild().save();
	order.status = OrderStatus.Cancelled; // order cancelled
	order.version++;
	await order.save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token,
	});
	expect(response.status).toEqual(400);
});
