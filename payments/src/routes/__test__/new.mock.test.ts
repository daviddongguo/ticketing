import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';
import {Payment} from '../../models/payment';
import {natsWrapper} from '../../nats-wrapper';
import {stripe} from '../../stripe';
import {STRIPE_ID} from './../../__mocks__/stripe';

jest.mock('../../stripe');  // not the real stripe
jest.mock('../../nats-wrapper')

const url = '/api/payments';
const userId = mongoose.Types.ObjectId().toHexString();
const token= 'tok_fake';
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

it('finishes a payment and save it into database', async () => {
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

  const payment = await Payment.findOne({orderId: order.id});
  if(!payment){
    fail();
  }
  expect(payment.stripeId).toEqual(STRIPE_ID);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

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
