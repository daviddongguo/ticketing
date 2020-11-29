import express, {Request, Response} from 'express';
import {Ticket} from '../models/ticket';
import {DatabaseConnectionError} from './../../../common/src/errors/database-connection-error';
import {NotFoundError} from './../../../common/src/errors/not-found-error';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
	let query = {};

	try {
		const tickets = await Ticket.find(query);
		return res.status(200).send({tickets});
	} catch (error) {
		throw new DatabaseConnectionError('Broke! as querying ticket');
	}
});
router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
	const ticketId = req.params.ticketId;
	if (!ticketId) {
    throw new NotFoundError(`id=${ticketId} not found.`);
	}
	const query = {_id: ticketId};

	try {
    const ticket = await Ticket.findOne(query);
    const tickets = [ticket];
		return res.status(200).send({tickets});
	} catch (error) {
		throw new DatabaseConnectionError('Broke! as querying ticket');
	}
});

export {router as showTicketsRouter};

