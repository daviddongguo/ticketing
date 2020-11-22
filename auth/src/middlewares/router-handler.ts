import {NextFunction, Request} from 'express';

export const routerHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
  console.log(`${req.url}`);
};
