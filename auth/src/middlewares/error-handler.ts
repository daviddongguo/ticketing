import {NextFunction, Request, Response} from 'express';
import {DatabaseConnectionError} from '../errors/database-connection-error';
import {RequestValidationError} from '../errors/request-validation-error';

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof RequestValidationError) {
		console.error('hadnling error as a request validation error');
		res.status(404).send(err.message);
	}

	if (err instanceof DatabaseConnectionError) {
		console.error('handling error as database connection error');
		console.error(err.stack);
		res.status(500).send(err.message);
	}
};
