import {NextFunction, Request, Response} from 'express';
import {UserDoc} from '../models/user';
import {verifyToken} from '../services/token';

declare global {
  namespace Express{
    interface Request {
      currentUser?: UserDoc | null;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.currentUser = verifyToken(req.session?.jwt);
  return next();
};
