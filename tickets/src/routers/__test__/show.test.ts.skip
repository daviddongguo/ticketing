import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';

const baseUrl = '/api/tickets';
const title = 'it is a title';
const price: number = 1.99;
const id = mongoose.Types.ObjectId().toHexString();
let ticketId = 'ticketId';

beforeEach(async () => {
	const response = await request(app)
		.post(baseUrl)
		.set('Cookie', global.cookie)
		.send({title, price})
		.expect(201);
	ticketId = response.body.id;
	await request(app)
		.post(baseUrl)
		.set('Cookie', global.cookie)
		.send({title: title + ', second', price})
		.expect(201);
});

it(`retrieves one ticket to ${baseUrl}/${ticketId} for get requests`, async () => {
	const response = await request(app).get(baseUrl + `/${ticketId}`).send();
	expect(response.status).toEqual(200);
	expect(response.body.tickets.length).toEqual(1);
	expect(response.body.tickets[0].title).toEqual(title);
	expect(response.body.tickets[0].price).toEqual(price);
});

it('returns a  404 if the ticket is not found', async () => {
  const response = await request(app).get(baseUrl + '/' + id).expect(404);
});

it('returns a  400 if the ticketId is not valid', async () => {
	const response = await request(app).get(baseUrl + '/53cb6b9b').expect(400);
});

