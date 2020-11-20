import {json} from 'body-parser';
import express from 'express';
import {currentUserRouter} from './routers/current-user';

const app = express();
app.use(json());

app.use(currentUserRouter);

app.get('/api/users/test', (req, res)=>{
  console.log(req.url);
  // console.log(req.route);
  res.status(200).json({message: 'Hi, there!', url: `{req.url}`});
});

app.listen(3018, ()=>{
  console.log('Auth server is listening on port 3018...');
});
