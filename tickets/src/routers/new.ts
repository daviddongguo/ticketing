import {DatabaseConnectionError, requireAuth, validateRequest} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {TicketCreatedPublisher} from '../events/publishers/ticket-created-publisher';
import {Ticket} from '../models/ticket';
const router = express.Router();

router.post(
	'/api/tickets',
	requireAuth, // Throw Error if currentUser is null
	[
		body('title')
			.trim()
			.isLength({min: 5, max: 200})
			.withMessage('Title is required.'),
		body('price')
			.isFloat({gt: 0.0})
			.withMessage('Price must be greater than 0.0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const {title, price} = req.body;
		const userId = req.currentUser!.id;
		try {
      const newTicket = Ticket.build({title, price, userId});
      // Save locally and Push event
      await newTicket.save();
      new TicketCreatedPublisher(client).publish({
        id: newTicket.id,
        title: newTicket.title,
        price: newTicket.price,
        userId: newTicket.userId,
      });
			return res.status(201).send(newTicket);
		} catch (error) {
			throw new DatabaseConnectionError('Broke! as saving ticket');
		}
	}
);

export {router as createTicketRouter};

