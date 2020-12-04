import {
  BadRequestError,
  DatabaseConnectionError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth, validateRequest
} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import {OrderUpdatedPublisher} from '../events/publishers/order-updated-publisher';
import {Order} from '../models/order';
import {natsWrapper} from '../nats-wrapper';
const router = express.Router();

router.put(
	'/api/orders/:id',
	requireAuth, // Throw Error if currentUser is null
	[
		body('status')
      .trim()
      .notEmpty(),
  ],
  validateRequest,
	async (req: Request, res: Response) => {
		// returns 400
		const orderId = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(orderId)) {
			throw new BadRequestError('invalid order id.');
		}

		// returns 500, 404
		let dbOrder = null;
		try {
			dbOrder = await Order.findById(orderId);
		} catch (error) {
			throw new DatabaseConnectionError('Ooops....');
		}
		if (!dbOrder) {
			throw new NotFoundError(`Order(id=${orderId})`);
		}

		// returns 401
		if (dbOrder.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		const {status} = req.body;
		try {
      // save doc to DB and push event to NATS
			dbOrder.status = status ? status : 'pending';
      await dbOrder.save();
      await new OrderUpdatedPublisher(natsWrapper.client).publish({
        id: dbOrder.id,
        ticketId: dbOrder.ticketId,
        userId: dbOrder.userId,
        status: dbOrder.status,
        expiresAt: dbOrder.expiresAt,
      });
			return res.status(204).send(dbOrder);
		} catch (error) {
			throw new DatabaseConnectionError('Broke! as updating order');
		}
	}
);

export {router as updateOrderRouter};

