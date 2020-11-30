import {DatabaseConnectionError} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {Ticket} from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
	try {
		const tickets = await Ticket.find({});
		return res.status(200).send({tickets});
	} catch (error) {
		throw new DatabaseConnectionError('Broke! as querying ticket');
	}
});

export {router as indexOfTicketsRouter};

