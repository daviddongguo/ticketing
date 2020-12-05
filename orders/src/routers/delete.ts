import {
  BadRequestError,
  DatabaseConnectionError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
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
		if (dbOrder.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError(
				`Order(id=${orderId}) is not belong to you!`
			);
    }

    try {
      dbOrder.status = OrderStatus.Cancelled;
      await dbOrder.save();
      return res.status(204).send(dbOrder);

      // publish an event saying this order was cancelled!

    } catch (error) {
      throw new DatabaseConnectionError();
    }

	}
);

export {router as deleteOrdersRouter};

