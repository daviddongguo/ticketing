import 'express-async-errors';
import mongoose from 'mongoose';
import {app} from './app';
const mongoDbString = require('../configs/mongoDb');

const start = async () => {
  let connectionString = '';
  if(process.env.NODE_ENV === 'local'){
    connectionString = mongoDbString.localDb;
    process.env.JWT_KEY = "local-jwt-key";
  }else{
    if(!mongoDbString.googleDb){
      throw new Error('MONGO_URI must be defined.')
    }
    connectionString = mongoDbString.googleDb;

    if(!process.env.JWT_KEY){
      throw new Error('JWT_KEY must be defined.')
    }
  }

	try {

		await mongoose.connect(connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to MongoDb by ' + `${connectionString}`);
	} catch (error) {
		console.error(error);
	}

	app.listen(3019, () => {
		console.log('Tickets server is listening on port 3019...');
	});
};

start();
