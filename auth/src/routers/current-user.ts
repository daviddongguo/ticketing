import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  console.log(`${req.url}`);
	res.status(200).json({message: `${req.url}`});
});

export {router as currentUserRouter};

