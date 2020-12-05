import {
  BadRequestError,
  DatabaseConnectionError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth
} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {Order, OrderDoc} from '../models/order';
const mongoose = require('mongoose');

const router = express.Router();

router.get(
	'/api/orders/:orderId',
	requireAuth,
	async (req: Request, res: Response) => {
		const currentUserId = req.currentUser?.id;
		const orderId = req.params.orderId;

		// returns 400 if error
		if (!mongoose.Types.ObjectId.isValid(orderId)) {
			throw new BadRequestError(`${orderId} is not a valid mongoose objectId`);
		}

		// returns 400 if error
		let order: OrderDoc | null = null;
		try {
			order = await Order.findById(orderId).populate('ticket');
		} catch (error) {
			throw new DatabaseConnectionError(error.message);
		}

		// returns 404 if error
		if (!order) {
			throw new NotFoundError(`id=${orderId}`);
		}

		// returns 401 if the current user does not own the order
		if (order.userId !== currentUserId) {
			throw new NotAuthorizedError(
				`Order(id=${orderId}) is not belong to you!`
			);
		}

		return res.status(200).send({orders: [order]});
	}
);

export {router as showOrdersRouter};

