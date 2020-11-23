import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import logger from 'morgan'; //Note logger = morgan~!
import {NotFoundError} from './errors/not-found-error';
import {errorHandler} from './middlewares/error-handler';
import {currentUserRouter} from './routers/current-user';
import {signinRouter} from './routers/signin';
import {signoutRouter} from './routers/signout';
import {signupRouter} from './routers/signup';
const mongoDbString = require('../configs/mongoDb');
const app = express();
// traffic is being proximate to our application through ingress engine express
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
    secure: true,
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
	})
);

app.use(logger('dev')); //log every request to the CONSOLE.

app.get('/api/users/test', async (req, res) => {
	res.status(200).json({message: 'Hi, there!', url: `${req.url}`});
});

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError(`${req.url}`);
});

app.use(errorHandler);

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
