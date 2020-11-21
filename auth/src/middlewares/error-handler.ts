import {NextFunction, Request, Response} from 'express';
import {CustomError} from '../errors/custom-error';

export const errorHandler = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
  res.status(err.statusCode).send({errors: err.serializeErrors()});
};
