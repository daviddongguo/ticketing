import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import {BadRequestError} from '../errors/bad-request-error';
import {DatabaseConnectionError} from '../errors/database-connection-error';
import {RequestValidationError} from '../errors/request-validation-error';
import {User} from '../models/user';

const router = express.Router();

router.post(
	'/api/users/signup',
	[
		body('email').isEmail().normalizeEmail().withMessage('Email must be valid'),
		body('password')
			.not()
			.isEmpty()
			.trim()
			.isLength({min: 3})
			.withMessage('Password must have at least 3 characters'),
	],
	async (req: Request, res: Response) => {
		// 1 check the email and password format
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throw new RequestValidationError(errors.array());
		}

		const {email, password} = req.body;
		// 2 check to see if email is already in use
		let existingUser;
		try {
			existingUser = await User.findOne({email}).maxTimeMS(2000);
		} catch (error) {
			throw new DatabaseConnectionError();
		}
		if (existingUser) {
			throw new BadRequestError('Email', 'Email in use.');
		}

		// 3 Try to create new User
		try {
			const user = User.build({email, password});
			await user.save();
			// user is now considered to be logged in.
			// Send he a cookie / jwt
			res.status(201).send(user);
		} catch (error) {
			throw new DatabaseConnectionError();
		}
	}
);

export {router as signupRouter};
