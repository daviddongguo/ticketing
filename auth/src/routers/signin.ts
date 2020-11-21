import express, {Request, Response} from 'express';

const router = express.Router();

router.post('/api/users/signin', (req: Request, res: Response) => {
	console.log(`{req.rul}`);
	res.status(200).json({message: `${req.url}`});
});

export {router as signinRouter};
