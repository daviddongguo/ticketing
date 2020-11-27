import {currentUser} from '@davidgarden/common';
import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser',
currentUser,    // req.currentUser = null when token is invalid or not provided
(req, res) => {
	return res.status(200).send({currentUser: req.currentUser});
});

export {router as currentUserRouter};

