import jwt from 'jsonwebtoken';
import {UserDoc} from '../models/user';

export const generateToken = (user: UserDoc) => {
	return jwt.sign({
    id: user.id,
    email: user.email
  },
  process.env.JWT_KEY!
  );
};
