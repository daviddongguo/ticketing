import 'express-async-errors';
import mongoose from 'mongoose';
import {app} from './app';
import {OrderCancelledListener} from './events/listeners/order-cancelled-listener';
import {OrderCreatedListener} from './events/listeners/order-created-listener';
import {natsWrapper} from './nats-wrapper';

const start = async () => {
	let mongoStr = process.env.MONGO_URI || '';
  let clusterId = process.env.NATS_CLUSTER_ID || '';
  let clientId = process.env.NATS_CLIENT_ID || '';
  let natsUrl = process.env.NATS_URL || '';

	if (process.env.NODE_ENV === 'local') {
		mongoStr = 'mongodb://127.0.0.1/payments';
    clusterId = 'ticketing';
    clientId = 'local-tickets-client';
		natsUrl = 'http://35.196.98.224:4222';
    process.env.JWT_KEY = 'local-jwt-key';
	} else {
		if (mongoStr === '') {
			throw new Error('MONGO_URI must be defined.');
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

    if (process.env.JWT_KEY === '') {
			throw new Error('JWT_KEY must be defined.');
    }
	}

	try {
		await mongoose.connect(mongoStr, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
    console.log('Connected to MongoDb by ' + `${mongoStr}`);

		await natsWrapper.connect(
			clusterId,
			clientId,
			natsUrl
		);
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
    new OrderCancelledListener(natsWrapper.client).listen();

	} catch (error) {
		console.error(error);
	}

	app.listen(3022, () => {
		console.log('Payments listening on port 3022...');
	});
};

start();
