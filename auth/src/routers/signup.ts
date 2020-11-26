import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {BadRequestError} from '../errors/bad-request-error';
import {DatabaseConnectionError} from '../errors/database-connection-error';
import {validateRequest} from '../middlewares/validate-request';
import {User} from '../models/user';
import {generateToken} from '../services/token';

const router = express.Router();

router.post(
	'/api/users/signup',
	[
		body('email')
			.trim()
			.isEmail()
			.normalizeEmail()
			.withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({min: 3})
			.withMessage('Password must be at least 3 characters'),
  ],
	validateRequest,
	async (req: Request, res: Response) => {
		// 1 check the email and password format

		// 2 check to see if email is already in use
		const {email, password} = req.body;
		let existingUser;
		try {
			existingUser = await User.findOne({email}).maxTimeMS(2000).exec();
		} catch (error) {
			throw new DatabaseConnectionError();
		}
		if (existingUser) {
			throw new BadRequestError('Email in use.', 'Email');
		}

		// 3 Try to create new User
		try {
			const newUser = User.build({email, password});
			await newUser.save();
			// user is now considered to be logged in.
			// Generate JWT and Store it on session object
			const accessToken = generateToken(newUser);

			req.session = {jwt: accessToken};

			res.status(201).send({accessToken, user: newUser});
		} catch (error) {
			throw new DatabaseConnectionError();
		}
	}
);

export {router as signupRouter};
