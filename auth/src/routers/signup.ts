import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import {DatabaseConnectionError} from '../errors/database-connection-error';
import {RequestValidationError} from '../errors/request-validation-error';

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
	async(req: Request, res: Response) => {
		// 1 check the email and password format
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.error(errors.array());
			throw new RequestValidationError(errors.array());
		}

		const {email, password} = req.body;
		// 2 check to see if email is already in use

		// 3 Try to create new User
		throw new DatabaseConnectionError("Opps!");
	}
);

export {router as signupRouter};

