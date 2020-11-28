import 'express-async-errors';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
	namespace NodeJS {
		interface Global {
			signup(email: string): Promise<string[]>;
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

// global.signup = async (email: string, password?: string) => {
// 	const response = await request(app)
// 		.post('/api/users/signup')
// 		.send({
// 			email,
// 			password: password || 'test',
// 		})
// 		.expect(201);
// 	return response.get('Set-Cookie');
// };
