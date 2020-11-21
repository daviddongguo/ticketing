import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';

const router = express.Router();

router.post(
	'/api/users/signup',
	[
		body('email').isEmail().normalizeEmail().withMessage('Email must be valid'),
		body('password').not().isEmpty().trim().isLength({min: 3}).withMessage('Password must have at least 3 characters'),
	],
	(req: Request, res: Response) => {
		console.log(`${req.baseUrl}${req.url}`);

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).send(errors.array());
		}

		const {email, password} = req.body;

		res.status(201).json({email: email});
	}
);

export {router as signupRouter};

