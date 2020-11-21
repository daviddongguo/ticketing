import {json} from 'body-parser';
import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import {NotFoundError} from './errors/not-found-error';
import {errorHandler} from './middlewares/error-handler';
import {currentUserRouter} from './routers/current-user';
import {signinRouter} from './routers/signin';
import {signoutRouter} from './routers/signout';
import {signupRouter} from './routers/signup';

const app = express();
app.use(json());

app.get('/api/users/test', async (req, res) => {
	console.log(req.url);
	// console.log(req.route);
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
	try {
		await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
    });
    console.log("Connected to MongoDb.")
	} catch (error) {
		console.error(error);
	}

	app.listen(3018, () => {
		console.log('Auth server is listening on port 3018...');
	});
};

start();
