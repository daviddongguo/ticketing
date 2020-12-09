import {ExpirationCompleteEvent, OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Order} from '../../../models/order';
import {Ticket} from '../../../models/ticket';
import {EXPIRATION_WINDOW_SECONDS} from '../../../routers/new';
import {natsWrapper} from '../../../__mocks__/nats-wrapper';
import {ExpirationCompletedListener} from '../expiration-completed-listener';


const setup = async () => {
  const ticket =  Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'a test event',
    price: 1.991
  });
  await ticket.save();
  console.log('ticker created.');

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
  const order =  Order.build({
    userId: 'mongoose.Types.ObjectId().toHexString()',
    ticket,
    status: OrderStatus.Created,
    expiresAt: expiration,
  })
  await order.save();
  console.log('order created');
  console.log(order);

  // create an instance of the listener
  // @ts-ignore
	const listener = new ExpirationCompletedListener(natsWrapper.client);
	// create a fake data event
	const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
	};
	// create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return {listener, data, msg};
};

it('updates the order status to cancelled and emit an OrderCancelled event' , async () => {
  const {listener, data, msg} = await setup();
  const dbOrder = await Order.findById(data.orderId).populate('ticket');
	if (!dbOrder) {
		fail();
  }
  expect(dbOrder.status).not.toEqual(OrderStatus.Cancelled);
  expect(dbOrder.ticket).toBeDefined();
  console.log(dbOrder.status);

	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure a ticket was created.
	const updatedOrder = await Order.findById(data.orderId);
	if (!updatedOrder) {
    console.log('-------can not find order!!!!')
	}
  console.log(updatedOrder!.status);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  // expect(updatedOrder?.ticket).not.toBeDefined();         // updated/
  expect(msg.ack).toBeCalled();               // acks the message
                                              // publishes an event
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  console.log('-----------natsWrapper.client.publish.mock.calls------------');
  console.log(natsWrapper.client.publish.mock.calls);
  const eventData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1]);
  expect(eventData.id).toEqual(dbOrder.id);
});

it('do nothing if the order is complete' , async () => {
  const {listener, data, msg} = await setup();
  const dbOrder = await Order.findById(data.orderId).populate('ticket');
	if (!dbOrder) {
		fail();
  }
  dbOrder.set({status: OrderStatus.Complete});
  await dbOrder.save();
  console.log(dbOrder.status);

	// call the onMessage function with the data object + message objec
	await listener.onMessage(data, msg);
	// write assertions to make sure a ticket was created.
	const updatedOrder = await Order.findById(data.orderId);
	if (!updatedOrder) {
    console.log('-------can not find order!!!!');
    fail();
	}
	expect(updatedOrder!.status).not.toEqual(OrderStatus.Cancelled);
  // expect(updatedOrder?.ticket).not.toBeDefined();         // updated/
  expect(msg.ack).toBeCalled();               // acks the message
                                              // publishes an event
  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});
