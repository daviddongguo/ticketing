import {randomBytes} from 'crypto';
import nats from 'node-nats-streaming';
import {TicketCreatedPublisher} from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
	// use loadBalance
	url: 'http://35.196.98.224:4222',
});

let basePrice = 1.99;

stan.on('connect', async() => {
	console.log('Publisher connected to NATS');

	const publisher = new TicketCreatedPublisher(stan);

  try {
    await publisher.publish({
      id: randomBytes(4).toString('hex'),
      title: randomBytes(1).toString('hex'),
      price: ++basePrice,
    });
  } catch (error) {
    console.error(error);
  }

});
