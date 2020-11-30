import {BadRequestError, NotAuthorizedError, requireAuth, validateRequest} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {Ticket} from '../models/ticket';
import {DatabaseConnectionError} from './../../../common/src/errors/database-connection-error';
import {NotFoundError} from './../../../common/src/errors/not-found-error';
const router = express.Router();

router.put(
	'/api/tickets/:id',
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

    // returns 400
    const ticketId = req.params.id;
    if(mongoose.Types.ObjectID.isValid(ticketId)){
      throw new BadRequestError('invalid id.');
    }

    // returns 500, 404
    let dbTicket = null;
    try {
      dbTicket = await Ticket.findById(ticketId);
    } catch (error) {
      throw new DatabaseConnectionError();
    }
    if(!dbTicket){
      throw new NotFoundError(`Ticket(id=${ticketId})`);
    }

    // returns 401
    if(dbTicket.userId !== req.currentUser!.id){
      throw new NotAuthorizedError();
    }


		const {title, price} = req.body;
		try {
      dbTicket.title = title;
      dbTicket.price = price;
			await dbTicket.save();
			return res.status(200).send(dbTicket);
		} catch (error) {
			throw new DatabaseConnectionError('Broke! as saving ticket');
		}
	}
);

export {router as updateTicketRouter};

