import {NextFunction, Request, Response} from 'express';
import {CustomError} from '../errors/custom-error';

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof CustomError) {
		console.error(err.serializeErrors());
		res.status(err.statusCode).send({errors: err.serializeErrors()});
	} else {
		console.error(err.message);
		res
			.status(400)
			.send({errors: [{message: err.message || 'Something broke!'}]});
	}
};
