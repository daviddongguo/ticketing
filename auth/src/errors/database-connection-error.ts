import {CustomError} from './custom-error';
export class DatabaseConnectionError extends CustomError {
	constructor(message?: string) {
		super(message || 'Error connecting to database');
		Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
	}

	statusCode = 500;
	serializeErrors() {
		return [{message: this.message}];
	}
}
