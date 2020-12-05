import {
  BadRequestError,
  DatabaseConnectionError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest
} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import {Order} from '../models/order';
import {Ticket} from '../models/ticket';
import {OrderCreatedPublisher} from './../events/publishers/order-created-publisher';
import {natsWrapper} from './../nats-wrapper';
const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
	'/api/orders',
	requireAuth, // Throw Error if currentUser is null
	[
		body('ticketId')
			.trim()
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided.'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		// Find the ticket that the user is trying to order
		// in the database.
		const {ticketId} = req.body;
		const dbTicket = await Ticket.findById(ticketId);
		if (!dbTicket) {
			throw new NotFoundError(`Ticket(id=${ticketId}`);
		}

		// Make sure that the ticket is not already reserved
		// Run query to look at all orders.
		// Find an order where the ticket is the ticket
		// we just found *and* the order's status is *not* cancelled.
		// If we find and order from that means the ticket *is* reserved.
		if (await dbTicket.isReserved()) {
			throw new BadRequestError('Ticket(id=${ticketId} is already reserved.');
		}

		// Calculate an expiration date for this order.
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		try {
			// Build the order and save ti to the database
			const newOrder = Order.build({
				ticket: dbTicket,
				userId: req.currentUser!.id, // requireAuth verified it
				status: OrderStatus.Created,
				expiresAt: expiration,
			});
			await newOrder.save();

			// Publish an event saying that an order was created
			await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: newOrder.id,
        ticket: {
          id: newOrder.ticket.id,
          price: newOrder.ticket.price,
        },
				userId: newOrder.userId,
        status: newOrder.status,
        // avoid different time zone problem
				expiresAt: newOrder.expiresAt.toISOString(),
			});

			return res.status(201).send(newOrder);
		} catch (error) {
			throw new DatabaseConnectionError('Broke! as saving order');
		}
	}
);

export {router as createOrderRouter};

