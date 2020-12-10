import {requireAuth, validateRequest} from '@davidgarden/common';
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {Order} from '../models/order';
import {BadRequestError} from './../../../common/src/errors/bad-request-error';
import {NotAuthorizedError} from './../../../common/src/errors/not-authorized-error';
import {NotFoundError} from './../../../common/src/errors/not-found-error';
import {OrderStatus} from './../../../common/src/events/order-status';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const dbOrder = await Order.findById(orderId);
    if(!dbOrder){
      throw new NotFoundError(`Order(id=${orderId})`)
    }
    if(dbOrder.userId !== req.currentUser!.id){
      throw new NotAuthorizedError();
    }

    if(dbOrder.status !== OrderStatus.Cancelled){
      throw new BadRequestError('Can NOT pay for an cancelled order.', 'order.status');
    }

    return res.status(201).send({success: true, order: dbOrder});


	}
);

export {router as createChargeRouter};

