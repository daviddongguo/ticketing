
import express from 'express';

const router = express.Router();

router.get('/api/users/signout', (req, res) => {
	res.status(200).json({message: `${req.url}`});
});

export {router as signoutRouter};

