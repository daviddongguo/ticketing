import {TicketUpdatedEvent} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from '../../../__mocks__/nats-wrapper';
import {TicketUpdatedListener} from '../ticket-updated-listener';

const title = 'a fake title for testing';

const setup = async () => {
	// create and save a ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title,
		price: 1.99,
	});
	await ticket.save();
  // create an instance of the listener
  // @ts-ignore
	const listener = new TicketUpdatedListener(natsWrapper.client);
	// create a fake data event
	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		version: 1,
		title,
		price: 1.11,
		userId: mongoose.Types.ObjectId().toHexString(),
	};
	// create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return {listener, data, msg};
};

it('finds, updates, and saves a ticket', async () => {
	const {listener, data, msg} = await setup();
	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure a ticket was created.
	const ticket = await Ticket.findById(data.id);
	if (!ticket) {
		fail();
	}
	expect(ticket).toBeDefined();
	expect(ticket.id).toEqual(data.id);
	expect(ticket.title).toEqual(title);
	expect(ticket.price).toEqual(data.price);
	expect(ticket.version).toEqual(data.version);
});

it('acks the message', async () => {
	const {listener, data, msg} = await setup();
	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure ack function is called.
	expect(msg.ack).toBeCalled();
});

it('does not call ack if the event has a skipped version', async () => {
	const {listener, data, msg} = await setup();
	data.version = 123;
	try {
		await listener.onMessage(data, msg);
	} catch (error) {
    expect(error).toBeDefined();
  }
	// write assertions to make sure ack function is called.
	expect(msg.ack).not.toHaveBeenCalled();
});
