import {currentUser, errorHandler, NotFoundError} from '@davidgarden/common';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import logger from 'morgan'; //Note logger = morgan~!
import {indexOfOrdersRouter} from './routers';
import {deleteOrdersRouter} from './routers/delete';
import {createOrderRouter} from './routers/new';
import {showOrdersRouter} from './routers/show';

const app = express();
app.use(cors({ credentials: true }));
// traffic is being proximate to our application through ingress engine express
app.set('trust proxy', true); //  the X-Forwarded-* header fields may be trusted
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'local',
		name: 'session',
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	})
);

app.use(logger('dev')); //log every request to the CONSOLE.

app.get('/api/users/test', async (req, res) => {
	res.status(200).json({message: 'Hi, there!', url: `${req.url}`});
});

app.use(currentUser);

app.use(createOrderRouter);
app.use(indexOfOrdersRouter);
app.use(showOrdersRouter);
app.use(deleteOrdersRouter);
deleteOrdersRouter

app.all('*', async (req, res) => {
	throw new NotFoundError(`${req.url}`);
});

app.use(errorHandler);

export {app};

