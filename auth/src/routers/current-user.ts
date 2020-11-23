import express from 'express';
import {verifyToken} from '../services/token';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
	return res.status(200).json({currentuser: verifyToken(req.session?.jwt)});
});

export {router as currentUserRouter};

