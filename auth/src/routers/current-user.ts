import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  console.log(`{req.rul}`);
	res.status(200).json({message: `${req.url}`});
});

export {router as currentUserRouter};

