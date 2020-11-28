import express, {Request, Response} from 'express';

const router = express.Router();

router.post('/api/tickets', async (req: Request, res: Response)=>{

  return res.status(201).send();
});

export {router as createTicketRouter};

