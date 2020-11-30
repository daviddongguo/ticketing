import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';

const url = '/api/tickets';
const title = 'it is a updated title';
const oldTitle = 'it is a old title';
const price: number = 1.99;
const oldPrice: number = 9.11;
let ticketId = '';

beforeEach(async () => {
	const response = await request(app)
		.post(url)
		.set('Cookie', global.cookie)
		.send({title: oldTitle, price: oldPrice});
	ticketId = response.body.id;
	console.log(ticketId);
});

it('has a route handler listening to /api/tickets for put requests', async () => {
	const response = await request(app)
		.put(url + `/${ticketId}`)
		.send({title, price});
	expect(response.status).not.toEqual(404);
	expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in.', async () => {
	const response = await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price});
	expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title: 'abc', price})
		.expect(400);
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title: '                          ', price})
		.expect(400);
});

it('returns an error if an invalid price is provide.', async () => {
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price: 'abc'})
		.expect(400);
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price: true})
		.expect(400);
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price: -1.99})
		.expect(400);
});

it('Updates a ticket with valid inputs', async () => {

	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(200);
	const tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(title);
	expect(tickets[0].price).toEqual(price);
});

it('Returns 401 with different user', async () => {

	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.secondCookie)
		.send({title, price})
		.expect(401);
});

it('Returns 400 with empty ticket id', async () => {

	await request(app)
		.put(url + '/')
		.set('Cookie', global.secondCookie)
		.send({title, price})
		.expect(400);
});

it('Returns 400 with invalid ticket id', async () => {

	await request(app)
		.put(url + '/wrongid')
		.set('Cookie', global.secondCookie)
		.send({title, price})
		.expect(400);
});
