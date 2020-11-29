import request from 'supertest';
import {app} from '../../app';

const url = '/api/tickets';
const title = 'it is a title';
const price: number = 1.99;
let ticketId = '';

const createTickets = (async ()=>{
  const response = await request(app).post(url).set('Cookie', global.cookie).send({title,price}).expect(201);
  ticketId = response.body.id;
  console.log(`Created ticket : ${ticketId}`);
  await request(app).post(url).set('Cookie', global.cookie).send({title: title + ', second',price}).expect(201);
});

it(`has a route handler listening to ${url} for get requests`, async()=>{
  const response = await request(app).get(url);
	expect(response.status).not.toEqual(404);
});

it('returns all tickets to /api/tickets for get requests', async () => {
  await createTickets();
	const response = await request(app).get(url);
  expect(response.status).toEqual(200);
  // console.log(response.body);
  expect(response.body.tickets.length).toEqual(2);
});

it('returns one ticket to /api/tickets/id for get requests', async () => {
  await createTickets();
	const response = await request(app).get(url + `/${ticketId}`);
  expect(response.status).toEqual(200);
  console.log(ticketId);
  console.log(response.body);
  expect(response.body.tickets.length).toEqual(1);
  expect(response.body.tickets[0].title).toEqual(title);
  expect(response.body.tickets[0].price).toEqual(price);
});

it('returns 404 to /api/tickets/wrong-id for get requests', async () => {
   const response = await request(app).get(url + '/wrong-id');
   console.log(response.body);
});

