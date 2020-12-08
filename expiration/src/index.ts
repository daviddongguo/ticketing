import {OrderCreatedListener} from './events/listeners/order-created-listener';
import {natsWrapper} from './nats-wrapper';

const start = async () => {
	let clusterId = process.env.NATS_CLUSTER_ID || '';
	let clientId = process.env.NATS_CLIENT_ID || '';
	let natsUrl = process.env.NATS_URL || '';

	if (process.env.NODE_ENV === 'local') {
		clusterId = 'ticketing';
		clientId = 'local-tickets-client';
		natsUrl = 'http://35.196.98.224:4222';
  }

	if (clusterId === '') {
		throw new Error('CLUSTER_ID must be defined.');
	}

	if (clientId === '') {
		throw new Error('NATS_URL must be defined.');
	}
	if (natsUrl === '') {
		throw new Error('CLIENT_ID must be defined.');
	}

	try {
		await natsWrapper.connect(clusterId, clientId, natsUrl);
		natsWrapper.client.on('close', () => {
			console.log('NATS connection close');
			process.exit();
		});
		process.on('SIGINT', () => {
			natsWrapper.client.close();
		});
		process.on('SIGTERM', () => {
			natsWrapper.client.close();
    });

    new OrderCreatedListener(natsWrapper.client).listen();
	} catch (error) {
		console.error(error);
	}
};

start();
