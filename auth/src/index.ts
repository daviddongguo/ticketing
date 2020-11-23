import 'express-async-errors';
import mongoose from 'mongoose';
import {app} from './app';
const mongoDbString = require('../configs/mongoDb');

const start = async () => {
  if(process.env.NODE_ENV === 'local'){
    process.env.JWT_KEY = "local-jwt-key";
  }
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY must be defined.')
  }

	try {
		let connectionString = mongoDbString.googleDb;
		if (process.env.NODE_ENV === 'local') {
			connectionString = mongoDbString.localDb;
		}

		await mongoose.connect(connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to MongoDb by ' + `${connectionString}`);
	} catch (error) {
		console.error(error);
	}

	app.listen(3018, () => {
		console.log('Auth server is listening on port 3018...');
	});
};

start();
