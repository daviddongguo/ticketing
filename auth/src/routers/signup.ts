
import express from 'express';

const router = express.Router();

router.get('/api/users/signup', (req, res) => {
  console.log(`${req.baseUrl}`);
  console.log(`${req.url}`);

  const { email, password} = req.body;

	res.status(200).json({message: `${req.url}`});
});

export {router as signupRouter};

