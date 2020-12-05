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

router.delete(
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
		let dbOrder: OrderDoc | null = null;
		try {
			dbOrder = await Order.findById(orderId).maxTimeMS(200).exec();
		} catch (error) {
			throw new DatabaseConnectionError(error.message);
		}

		// returns 404 if error
		if (!dbOrder) {
			throw new NotFoundError(`id=${orderId}`);
		}

		// returns 401 if the current user does not own the order
		if (dbOrder.userId !== currentUserId) {
			throw new NotAuthorizedError(
				`Order(id=${orderId}) is not belong to you!`
			);
    }

    try {
      await dbOrder.remove();
      return res.status(204).send();

    } catch (error) {
      throw new DatabaseConnectionError();
    }

	}
);

export {router as deleteOrdersRouter};

