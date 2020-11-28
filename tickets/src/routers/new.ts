import {requireAuth} from '@davidgarden/common';
import express, {Request, Response} from 'express';

const router = express.Router();

router.post('/api/tickets', requireAuth, async (req: Request, res: Response)=>{

  return res.status(200).send('success');

});

export {router as createTicketRouter};

