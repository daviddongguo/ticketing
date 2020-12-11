import {OrderStatus} from '@davidgarden/common';
import 'express-async-errors';
import jwt from 'jsonwebtoken';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {Order, OrderDoc} from '../models/order';
import {Ticket, TicketDoc} from '../models/ticket';

declare global {
	namespace NodeJS {
		interface Global {
			signup(id: string, email: string): Promise<string[]>;
			signin(id: string, email: string): Promise<string[]>;
			createTicket(title?: string, price?: number): Promise<TicketDoc>;
			createOrder(ticket: TicketDoc, userId: string): Promise<OrderDoc>;
			cookie: string[];
			secondCookie: string[];
			userId: string;
			secondUserId: string;
			ticketId: string;
			secondTicketId: string;
		}
	}
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'a-temp-key-for-test';
	global.userId = '5fc1b60998119500225995d7';
	global.secondUserId = '5fb9dd9621eadf145c9fc7ba';
	global.cookie = await global.signup(global.userId, 'test@test.com');
	global.secondCookie = await global.signup(
		global.secondUserId,
		'test2@test.com'
	);

	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	try {
		await mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	} catch (error) {
		console.error(error);
	}
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	if (!mongo || !mongoose) {
		return;
	}
	try {
		await mongo.stop();
		await mongoose.connection.close();
	} catch (error) {
		console.error(error);
	}
});

global.signup = async (id: string, email: string) => {
	// Build a JWT payload. {id, email}
	const payload = {id, email};

	// Create the JWT
	const accessToken = jwt.sign(payload, process.env.JWT_KEY!);

	// Build success Object. {jwt: MY_JWT}
	const session = {jwt: accessToken};

	//  Turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	// Take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// Return a string that is the cookie with the encoded data
	return [`session=${base64};`];
};

global.signin = async (id: string, email: string, password?: string) => {
	// session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtWXpKaU9HVm1Zemt5WWpZM05HVmxPRE14WWpOa015SXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCbGJXRnBiQzVqYjIwaUxDSnBZWFFpT2pFMk1EWTFPVFk0TkRkOS5YU0FMTWw3YTNKc185ZFpBX2t2U25hX2F0TnFZb0hnRmg2cHdBcmo1c3ZjIn0=; path=/; expires=Sun, 29 Nov 2020 20:54:07 GMT; httponly
	return await global.signup(id, email);
};

global.createTicket = async (title?: string, price?: number) => {
	const ticket = Ticket.build({
		title: title || 'an event created for testing.',
		price: price || 0.99,
	});
	await ticket.save();
	return ticket;
};
global.createOrder = async (ticket: TicketDoc, userId: string) => {
	const expiration = new Date();
	expiration.setSeconds(expiration.getSeconds() + 15 * 60);
	const order = Order.build({
		ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: expiration,
	});
	await order.save();
	return order;
};
