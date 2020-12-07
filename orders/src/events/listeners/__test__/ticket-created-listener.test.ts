import {TicketCreatedEvent} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from '../../../__mocks__/nats-wrapper';
import {TicketCreatedListener} from '../ticket-created-listener';

const id = mongoose.Types.ObjectId().toHexString();
const title = 'a fake title for testing';

const setup = async () => {
  // create an instance of the listener
  // @ts-ignore
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id,
    version: 0,
    title,
    price: 1.11,
    userId: mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg};
};

it('creats and saves a ticket', async () => {
  const {listener, data, msg} = await setup();
  // call the onMessage function with the data object + message objec
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created.
  const ticket =await Ticket.findById(id);
  if(!ticket){
    fail();
  }
  expect(ticket).toBeDefined();
  expect(ticket.id).toEqual(id);
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
