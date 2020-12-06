import 'express-async-errors';
import mongoose from 'mongoose';
import {app} from './app';
import {TicketCreatedListener} from './events/listeners/ticket-created-listener';
import {TicketUpdatedListener} from './events/listeners/ticket-updated-listener';
import {natsWrapper} from './nats-wrapper';
const mongoDbString = require('../configs/mongoDb');

const start = async () => {
	let mongoDbConnectionString = mongoDbString.googleDb || '';
  let clusterId = process.env.NATS_CLUSTER_ID || '';
  let clientId = process.env.NATS_CLIENT_ID || '';
  let natsUrl = process.env.NATS_URL || '';

	if (process.env.NODE_ENV === 'local') {
		mongoDbConnectionString = mongoDbString.localDb;
    clusterId = 'ticketing';
    clientId = 'local-orders-client';
		natsUrl = 'http://35.196.98.224:4222';
    process.env.JWT_KEY = 'local-jwt-key';
	} else {
		if (mongoDbConnectionString === '') {
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
    // NATS begin
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    // NATS end

		await mongoose.connect(mongoDbConnectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to MongoDb by ' + `${mongoDbConnectionString}`);
	} catch (error) {
		console.error(error);
	}

	app.listen(3020, () => {
		console.log('Orders server is listening on port 3020...');
	});
};

start();
