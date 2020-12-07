import {OrderCreatedEvent, OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from './../../../__mocks__/nats-wrapper';
import {OrderCreatedListener} from './../order-created-listener';

const setup = async () => {
  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'a test event',
    price: 1.123,
    userId: 'mongoose.Types.ObjectId().toHexString()',
  });
  await ticket.save();

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
        id: ticket.id,
        price: ticket.price,
    },
  };

  // Fake an Message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg};
};

it('sets the userId of the ticket', async () => {
  const {listener, data, msg} = await setup();
  // call the onMessage function with the data object + message objec
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created.
  const updatedTicket =await Ticket.findById(data.ticket.id);
  if(!updatedTicket){
    fail();
  }
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket.orderId).toEqual(data.id);
  expect(updatedTicket.id).toEqual(data.ticket.id);
});

it('acks the message', async () => {
  const {listener, data, msg} = await setup();
  // call the onMessage function with the data object + message objec
  await listener.onMessage(data, msg);
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
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
