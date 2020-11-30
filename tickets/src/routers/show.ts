import {
  BadRequestError,
  DatabaseConnectionError,
  NotFoundError
} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {Ticket, TicketDoc} from '../models/ticket';
const mongoose = require('mongoose');

const router = express.Router();

router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId;

  // returns 400 if error
	if (!mongoose.Types.ObjectId.isValid(ticketId)) {
		throw new BadRequestError(`${ticketId} is not a valid mongoose objectId`);
  }

  // returns 400 if error
	let ticket: TicketDoc | null = null;
	try {
	ticket = await Ticket.findById(ticketId).maxTimeMS(200).exec();
	} catch (error) {
		throw new DatabaseConnectionError(error.message);
  }

  // returns 404 if error
	if (!ticket) {
		throw new NotFoundError(`id=${ticketId}`);
	}

	return res.status(200).send({tickets: [ticket]});
});

export {router as showTicketsRouter};

