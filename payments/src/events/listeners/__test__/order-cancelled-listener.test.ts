import {OrderCancelledEvent, OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Order} from '../../../models/order';
import {natsWrapper} from '../../../__mocks__/nats-wrapper';
import {OrderCancelledListener} from '../order-cancelled-listener';

const setup = async () => {
  const orderId = mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
    id: orderId,
    status: OrderStatus.Created,
    version: 11,
		userId: 'mongoose.Types.ObjectId().toHexString()',
		price: 1.0,
  });
	await order.save();

  // @ts-ignore
	const listener = new OrderCancelledListener(natsWrapper.client);
	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 12,
		ticket: {
			id: 'mongoose.Types.ObjectId().toHexString()',
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return {listener, data, msg};
};

it('updates the status of the order, and acks the message', async () => {
  const {listener, data, msg} = await setup();
  expect((await Order.findById(data.id))?.status).not.toEqual(OrderStatus.Cancelled);
	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure a ticket was created.
	const updatedOrder = await Order.findById(data.id);
	if (!updatedOrder) {
    fail();
	}
	expect(updatedOrder.id).toEqual(data.id);
	expect(updatedOrder.status).toEqual(OrderStatus.Cancelled); // updated the orderId
  expect(msg.ack).toBeCalled();               // acks the message
                                              // publishes an event
  // expect(natsWrapper.client.publish).toHaveBeenCalled();
  // console.log('-----------natsWrapper.client.publish.mock.calls------------');
  // console.log(natsWrapper.client.publish.mock.calls);
  // const ticketUpdatedData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1]);
  // expect(ticketUpdatedData.orderId).toEqual(undefined);
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
