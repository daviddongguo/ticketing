import {CustomError} from './custom-error';

export class NotAuthorizedError extends CustomError {
	constructor(message?: string) {
		super(message || 'Not Authorized!');
		Object.setPrototypeOf(this, NotAuthorizedError.prototype);
	}

	statusCode = 401;
	serializeErrors() {
		return [{message: this.message, url: 'api/users/login'}];
	}
}
