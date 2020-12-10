import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Order} from '../../models/order';

const url = '/api/payments';
const id = mongoose.Types.ObjectId().toHexString();
const userId = mongoose.Types.ObjectId().toHexString();
const cookie = global.signup(userId, 'fake@email.com');
const order = Order.build({
	id,
	status: OrderStatus.Created,
	version: 0,
	userId,
	price: 1.91,
});

it('returns success', async () => {
  await order.save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token: '',
	});
	expect(response.status).toEqual(201);
});

it('returns a 404 when purchasing an order that does not exits', async () => {
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token: '',
	});
	expect(response.status).toEqual(400);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async ()=>{
  await order.save();
	const response = await request(app).post(url).set('Cookie', global.signin('','')).send({
		orderId: order.id,
		token: '',
	});
	expect(response.status).toEqual(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  order.status = OrderStatus.Cancelled;
  await order.save();
	const response = await request(app).post(url).set('Cookie', cookie).send({
		orderId: order.id,
		token: '',
	});
	expect(response.status).toEqual(400);
});








