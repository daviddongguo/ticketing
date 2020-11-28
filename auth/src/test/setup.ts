import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../app';

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
  jest.setTimeout(10000);
});

afterAll(async () => {
  if(!mongo || !mongoose){
    return;
  }
  try {
    await mongo.stop();
    await mongoose.connection.close();
    // test throwing database connection err
    await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@email.com',
			password: 'test',
    })
    .expect(500).timeout(3000);
    await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@email.com',
			password: 'test',
    })
		.expect(500).timeout(3000);
  } catch (error) {
    // console.error(error);
  }


});

global.signup = async (email: string, password?: string) => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password: password || 'test',
		})
		.expect(201);
	return response.get('Set-Cookie');
};
