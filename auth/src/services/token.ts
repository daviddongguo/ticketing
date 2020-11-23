import jwt from 'jsonwebtoken';
import {UserDoc} from '../models/user';

const generateToken = (user: UserDoc) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
		},
		process.env.JWT_KEY!
	);
};

const verifyToken = (token: string) => {
  if(!token){
    console.error('token is not provided!');
    return null;
  }

	try {
    return jwt.verify(token, process.env.JWT_KEY!);
	} catch (error) {
    console.error('token is not valid!');
		return null;
	}
};

export {generateToken, verifyToken};

