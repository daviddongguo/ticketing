import {BadRequestError, DatabaseConnectionError, requireAuth} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import mongoose from 'mongoose';
import {Order} from '../models/order';
import {OrderCreatedPublisher} from './../events/publishers/order-created-publisher';
import {natsWrapper} from './../nats-wrapper';
const router = express.Router();


router.post(
	'/api/orders/:ticketId',
	requireAuth, // Throw Error if currentUser is null
	async (req: Request, res: Response) => {
    const {ticketId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(ticketId)){
      throw new BadRequestError(`ticketId = ${ticketId} is not valid`);
    }
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

