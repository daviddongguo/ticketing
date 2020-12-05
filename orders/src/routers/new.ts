import {
  DatabaseConnectionError,
  requireAuth
} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import {Order} from '../models/order';
import {validateRequest} from './../../../common/src/middlewares/validate-request';
import {OrderCreatedPublisher} from './../events/publishers/order-created-publisher';
import {natsWrapper} from './../nats-wrapper';
const router = express.Router();

router.post(
	'/api/orders',
	requireAuth, // Throw Error if currentUser is null
  [body('ticketId')
  .custom((input: string)=> mongoose.Types.ObjectId.isValid(input))
  .withMessage('TicketId must be provided.')],
	validateRequest,
	async (req: Request, res: Response) => {
		const {ticketId} = req.body;
		const userId = req.currentUser!.id;
		const status = 'pending';
		const expiresAt = 'a time string';
		try {
			// save doc to DB and push event to NATS
			const newOrder = Order.build({ticketId, userId, status, expiresAt});
			await newOrder.save();
			await new OrderCreatedPublisher(natsWrapper.client).publish({
				id: newOrder.id,
				ticketId: newOrder.ticketId,
				userId: newOrder.userId,
				status: newOrder.status,
				expiresAt: newOrder.expiresAt,
			});
			return res.status(201).send(newOrder);
		} catch (error) {
			throw new DatabaseConnectionError('Broke! as saving order');
		}
	}
);

export {router as createOrderRouter};

