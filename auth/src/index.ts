import {json} from 'body-parser';
import express from 'express';

const app = express();
app.use(json());

app.get('/api/users/test', (req, res)=>{
  console.log(req.url);
  console.log(req.route);
  res.status(200).json({message: 'Hi, there!'});
});
app.get('/api/users/currentuser', (req, res)=>{
  console.log('/api/users/test received.')
  res.status(200).json({message: 'Hi, there!'});
});

app.listen(3018, ()=>{
  console.log('Auth server is listening on port 3018...');
});
