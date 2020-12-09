import {requireAuth, validateRequest} from '@davidgarden/common';
import {Request, Response} from 'express';
import {body} from 'express-validator';
import {app} from '../app';


app.post('/api/charges', requireAuth, [body('orderid')], validateRequest, (req: Request, res: Response)=>{
  return res.status(201).send();
});
