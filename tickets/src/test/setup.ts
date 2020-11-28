import 'express-async-errors';
import jwt from 'jsonwebtoken';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';


declare global {
	namespace NodeJS {
		interface Global {
			signup(email: string): Promise<string[]>;
			signin(email: string): Promise<string[]>;
		}
	}
}

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'a-temp-key-for-test';

	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	try {
		await mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
    });
	} catch (error) {
		console.error(error);
	}
});

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
  }
});

afterAll(async () => {
  if(!mongo || !mongoose){
    return;
  }
  try {
    await mongo.stop();
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }


});

global.signup = async (email: string, password?: string) => {
  // Build a JWT payload. {id, email}
  const payload = {id: '5fc1b60998119500225995d7', email};

  // Create the JWT
  const accessToken  = jwt.sign(payload, process.env.JWT_KEY!);

  // Build success Object. {jwt: MY_JWT}
  const session = {jwt: accessToken };

  //  Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return a string that is the cookie with the encoded data
  return [`session=${base64};`];
};

global.signin = async (email: string, password?: string) => {
  // session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtWXpKaU9HVm1Zemt5WWpZM05HVmxPRE14WWpOa015SXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCbGJXRnBiQzVqYjIwaUxDSnBZWFFpT2pFMk1EWTFPVFk0TkRkOS5YU0FMTWw3YTNKc185ZFpBX2t2U25hX2F0TnFZb0hnRmg2cHdBcmo1c3ZjIn0=; path=/; expires=Sun, 29 Nov 2020 20:54:07 GMT; httponly
	return await global.signup(email);
};
