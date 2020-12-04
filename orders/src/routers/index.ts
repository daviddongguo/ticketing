import {DatabaseConnectionError, requireAuth} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {Order} from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth,async (req: Request, res: Response) => {
  const userId = req.currentUser!.id;
	try {
		const orders = await Order.find({userId});
		return res.status(200).send({orders});
	} catch (error) {
		throw new DatabaseConnectionError('Broke! as querying ticket');
	}
});

export {router as indexOfOrdersRouter};

