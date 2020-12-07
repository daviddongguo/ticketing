import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from './../../nats-wrapper';

const id = mongoose.Types.ObjectId().toHexString();

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

it('has a right route handler listening to but the user is not authenticated', async () => {
	const response = await request(app)
		.put(url + `/${ticketId}`)
		.send({title, price});
	expect(response.status).not.toEqual(404);
	expect(response.status).toEqual(401);
});

it('Returns 401 if the user does not own the ticket', async () => {

	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.secondCookie)
		.send({title, price})
		.expect(401);
});

it('returns a status other than 401 if the user is authenticated', async () => {
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

it('Updates a ticket successfully', async () => {
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(204);
	const tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(title);
	expect(tickets[0].price).toEqual(price);
});

it('Rejects updating a reserved ticket ', async () => {
  // Reserves a ticket
  const dbTicket = await Ticket.findById(ticketId);
  const orderId = mongoose.Types.ObjectId().toHexString();
  dbTicket!.set({orderId});
  await dbTicket?.save();

  // Try edit the ticket
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(400);
});

it('Updates a ticket without title input', async () => {
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({price})
		.expect(204);
	const tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(oldTitle);
	expect(tickets[0].price).toEqual(price);
});

it('Updates a ticket without price input', async () => {
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title})
		.expect(204);
	const tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(title);
	expect(tickets[0].price).toEqual(oldPrice);
});

it('Publish an event', async () => {
	await request(app)
		.put(url + `/${ticketId}`)
		.set('Cookie', global.cookie)
		.send({title})
		.expect(204);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Returns 400 if the provided id is invalid.', async () => {
	await request(app)
		.put(url + '/invalidId')
		.set('Cookie', global.secondCookie)
		.send({title, price})
		.expect(400);
});

it('Returns 404 if the provided id does not exist', async () => {
	await request(app)
		.put(url + `/${id}`)
		.set('Cookie', global.secondCookie)
		.send({title, price})
		.expect(404);
});
