import {OrderCreatedEvent, OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Order} from '../../../models/order';
import {natsWrapper} from './../../../__mocks__/nats-wrapper';
import {OrderCreatedListener} from './../order-created-listener';

const setup = async () => {

  // Create an instance of the listener by using mock natsWrapper
  // @ts-ignore
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'mongoose.Types.ObjectId().toHexString()',
    expiresAt: '',
    ticket: {
        id: mongoose.Types.ObjectId().toHexString(),
        price: 1.123,
    },
  };

  // Fake an Message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg};
};

it('replicates the order, acks message', async () => {
  const {listener, data, msg} = await setup();
  // call the onMessage function with the data object + message objec
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created.
  const dbOrder =await Order.findById(data.id);
  if(!dbOrder){
    fail();
  }
  expect(dbOrder).toBeDefined();
  expect(dbOrder.id).toEqual(data.id);
  expect(dbOrder.status).toEqual(data.status);
  expect(dbOrder.version).toEqual(data.version);
  expect(dbOrder.userId).toEqual(data.userId);
  expect(dbOrder.price).toEqual(data.ticket.price);

  expect(msg.ack).toBeCalled();
});

