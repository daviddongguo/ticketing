import {requireAuth, validateRequest} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('oderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		return res.status(201).send({success:true});
	}
);

export {router as createChargeRouter};
