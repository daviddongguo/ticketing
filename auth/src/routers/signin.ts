import {BadRequestError, validateRequest} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {Password} from '../services/password';
const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').trim().isEmail().withMessage('Email must be valid.'),
		body('password')
			.trim()
			.isLength({min: 3, max: 20})
			.withMessage('Password must be between 3 and 20 characters'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		// 1. Check the inputs format
		// 2. verify the email
		const {email, password} = req.body;
		const dbUser = await User.findOne({email}).maxTimeMS(2000).exec();
		if (!dbUser) {
			throw new BadRequestError('Invalid credentials.');
		}

		// 3. verify the password
		const passwordMatch = await Password.compare(dbUser.password, password);
		if (!passwordMatch) {
			throw new BadRequestError('Invalid credentials.');
		}

		// 4. user is considered to be logged in.
		// Send them a JWT in a cookie
		const accessToken = jwt.sign(
			{id: dbUser.id, email: dbUser.email},
			process.env.JWT_KEY!
		);
		req.session = {
			jwt: accessToken,
		};
		res.status(200).json({user: dbUser, accessToken});
	}
);

export {router as signinRouter};
