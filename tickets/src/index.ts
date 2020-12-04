import 'express-async-errors';
import mongoose from 'mongoose';
import {app} from './app';
import {natsWrapper} from './nats-wrapper';
const mongoDbString = require('../configs/mongoDb');

const start = async () => {
	let mongoDbConnectionString = '';
	let natsConnectiongUrl = 'http://nats-srv:4222';
	if (process.env.NODE_ENV === 'local') {
		mongoDbConnectionString = mongoDbString.localDb;
		natsConnectiongUrl = 'http://35.196.98.224:4222';
		process.env.JWT_KEY = 'local-jwt-key';
	} else {
		if (!mongoDbString.googleDb) {
			throw new Error('MONGO_URI must be defined.');
		}
		mongoDbConnectionString = mongoDbString.googleDb;

		if (!process.env.JWT_KEY) {
			throw new Error('JWT_KEY must be defined.');
		}
	}

	try {
		await natsWrapper.connect(
			'ticketing',
			'from-ticket-creat',
			natsConnectiongUrl
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

		await mongoose.connect(mongoDbConnectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to MongoDb by ' + `${mongoDbConnectionString}`);
	} catch (error) {
		console.error(error);
	}

	app.listen(3019, () => {
		console.log('Tickets server is listening on port 3019...');
	});
};

start();
