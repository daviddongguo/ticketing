import {
  BadRequestError,
  DatabaseConnectionError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest
} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import {TicketUpdatedPublisher} from '../events/publishers/ticket-updated-publisher';
import {Ticket} from '../models/ticket';
import {natsWrapper} from '../nats-wrapper';
const router = express.Router();

router.put(
	'/api/tickets/:id',
	requireAuth, // Throw Error if currentUser is null
	[
		body('title')
			.optional()
			.trim()
			.isLength({min: 5, max: 200})
			.withMessage('Title must be valid.'),
		body('price')
			.optional()
			.isFloat({gt: 0.0})
			.withMessage('Price must be greater than 0.0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		// returns 400
		const ticketId = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(ticketId)) {
			throw new BadRequestError('invalid ticket id.');
		}

		// returns 500, 404
		let dbTicket = null;
		try {
			dbTicket = await Ticket.findById(ticketId);
		} catch (error) {
			throw new DatabaseConnectionError('Ooops....');
		}
		if (!dbTicket) {
			throw new NotFoundError(`Ticket(id=${ticketId})`);
		}

		// returns 401
		if (dbTicket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		const {title, price} = req.body;
		try {
      // save doc to DB and push event to NATS
			dbTicket.title = title ? title : dbTicket.title;
			dbTicket.price = price ? price : dbTicket.price;
      await dbTicket.save();
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: dbTicket.id,
        title: dbTicket.title,
        price: dbTicket.price,
        userId: dbTicket.userId,
      });
			return res.status(204).send(dbTicket);
		} catch (error) {
			throw new DatabaseConnectionError('Broke! as updating ticket');
		}
	}
);

export {router as updateTicketRouter};

