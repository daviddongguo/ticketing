import {randomBytes} from 'crypto';
import nats, {Message} from 'node-nats-streaming';
console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
	url: 'http://35.196.98.224:4222',
});

stan.on('connect', () => {
	console.log('Listener connected to NATS');

	const options = stan.subscriptionOptions().setManualAckMode(true);
	const subscription = stan.subscribe(
		'ticket:created',
		'orders-service-queue-group',
		options
	);

	subscription.on('message', (msg: Message) => {
		// console.log('Message received.');
		// console.log(msg.getSubject());
		// console.log(msg.getSequence());
		// console.log(msg.getData());

		const data = msg.getData();
		if (typeof data === 'string') {
			console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    msg.ack();
	});
});
