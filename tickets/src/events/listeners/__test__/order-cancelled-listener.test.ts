import {OrderCancelledEvent} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from '../../../__mocks__/nats-wrapper';
import {OrderCancelledListener} from '../order-cancelled-listener';

const setup = async () => {
  const orderId = mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'a test event',
		price: 1.0,
		userId: mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({orderId});
	await ticket.save();

  // @ts-ignore
	const listener = new OrderCancelledListener(natsWrapper.client);
	const data: OrderCancelledEvent['data'] = {
		id: orderId,
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

it('updates th ticket, publishes an event, and acks the message', async () => {
  const {listener, data, msg} = await setup();
  expect((await Ticket.findById(data.ticket.id))?.orderId).toBeDefined();
	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure a ticket was created.
	const updatedTicket = await Ticket.findById(data.ticket.id);
	if (!updatedTicket) {
		fail();
	}
	expect(updatedTicket).toBeDefined();
	expect(updatedTicket.id).toEqual(data.ticket.id);
	expect(updatedTicket.orderId).not.toBeDefined();  // updated the orderId
  expect(msg.ack).toBeCalled();               // acks the message
                                              // publishes an event
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  // console.log('-----------natsWrapper.client.publish.mock.calls------------');
  // console.log(natsWrapper.client.publish.mock.calls);
  const ticketUpdatedData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1]);
  expect(ticketUpdatedData.orderId).toEqual(undefined);
});

it('does ack the message, ', async () => {
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
