import {OrderCancelledEvent} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from '../../../__mocks__/nats-wrapper';
import {OrderCancelledListener} from '../order-cancelled-listener';
const setup = async () => {
	const ticket = Ticket.build({
		title: 'a test event',
		price: 1.0,
		userId: mongoose.Types.ObjectId().toHexString(),
	});
	await ticket.save();

  // @ts-ignore
	const listener = new OrderCancelledListener(natsWrapper.client);
	const data: OrderCancelledEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 1,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return {listener, data, msg};
};

it('unlocks a ticket', async () => {
	const {listener, data, msg} = await setup();
	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure a ticket was created.
	const ticket = await Ticket.findById(data.ticket.id);
	if (!ticket) {
		fail();
	}
	expect(ticket).toBeDefined();
	expect(ticket.id).toEqual(data.ticket.id);
	expect(ticket.orderId).toEqual(undefined);
	console.log(ticket);
});

it('acks the message', async () => {
	const {listener, data, msg} = await setup();
	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure ack function is called.
	expect(msg.ack).toBeCalled();
});

it('does not ack the message', async () => {
	const {listener, data, msg} = await setup();
	data.version = 123;
	// call the onMessage function with the data object + message objec
	try {
		await listener.onMessage(data, msg);
	} catch (error) {
		expect(error).toBeDefined();
	}
	// write assertions to make sure ack function is called.
	expect(msg.ack).toBeCalled();
});


it('publishes a ticket updated event', async () => {
  const {listener, data, msg} = await setup();
  // call the onMessage function with the data object + message objec
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called.
  console.log('-----------natsWrapper.client.publish.mock.calls------------');
  console.log(natsWrapper.client.publish.mock.calls);

  const ticketUpdatedData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1]);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(ticketUpdatedData.orderId).toEqual(undefined);
});
