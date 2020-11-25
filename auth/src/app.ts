import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import logger from 'morgan'; //Note logger = morgan~!
import {NotFoundError} from './errors/not-found-error';
import {errorHandler} from './middlewares/error-handler';
import {currentUserRouter} from './routers/current-user';
import {signinRouter} from './routers/signin';
import {signoutRouter} from './routers/signout';
import {signupRouter} from './routers/signup';
const app = express();
app.use(cors({credentials: true, origin: true}));
// traffic is being proximate to our application through ingress engine express
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
    secure: (process.env.NODE_ENV !== 'test') && (process.env.NODE_ENV !== 'local'),
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


export {app};

