import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from './../../nats-wrapper';

const url = '/api/tickets';
const title = 'it is a title';
const price: number = 1.99;

it('has a route handler listening to /api/tickets for post requests', async () => {
	const response = await request(app).post(url).send({title, price});
	expect(response.status).not.toEqual(404);
	expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in.', async () => {
	const response = await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title, price});
	expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({price})
		.expect(400);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title: 'abc', price})
		.expect(400);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title: '                          ', price})
		.expect(400);
});

it('returns an error if an invalid price is provide.', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title})
		.expect(400);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title, price: 'abc'})
		.expect(400);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title, price: true})
		.expect(400);
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title, price: -1.99})
		.expect(400);
});

it('creates a ticket with valid inputs', async () => {
	let tickets = await Ticket.find({});
	expect(tickets.length).toEqual(0);

	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(201);
	tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(title);
	expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
	await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(201);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
