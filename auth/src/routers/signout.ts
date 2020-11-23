import express, {Request, Response} from 'express';

const router = express.Router();

router.get('/api/users/signout', (req: Request, res: Response) => {
	req.session = null;
	return res.status(200).send({url: '/api/users/signin'});
});

export {router as signoutRouter};

