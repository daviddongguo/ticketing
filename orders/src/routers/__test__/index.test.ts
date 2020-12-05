import request from 'supertest';
import {app} from '../../app';

const baseUrl = '/api/orders';

it(`has a route handler listening to ${baseUrl} for get requests`, async () => {
	const response = await request(app).get(baseUrl).set('Cookie', global.cookie);
	expect(response.status).not.toEqual(404);
});

it(`retrieves a list of orders to ${baseUrl} for get requests`, async () => {

  // Create three tickets
  const ticket01 = await global.createTicket();
  const ticket02 = await global.createTicket();
  const ticket = await global.createTicket();

  // Create one order as User #1
  await global.createOrder(ticket02, global.secondUserId);

  // Create two order as User #2
  await global.createOrder(ticket01, global.userId);
  await global.createOrder(ticket, global.userId);

  // Make request to get orders for User #2
  const response = await request(app).get(baseUrl).set('Cookie', global.cookie);

  // Make sure we only got the orders for User #2
	expect(response.status).toEqual(200);
  expect(response.body.orders.length).toEqual(2);
  expect(response.body.orders[0].ticket.id).toEqual(ticket01.id);
  expect(response.body.orders[1].ticket.id).toEqual(ticket.id);
});


