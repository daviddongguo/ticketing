import {CustomError} from './custom-error';

export class NotFoundError extends CustomError {
	constructor(message: string) {
		super(message + ' not found.');
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}

	statusCode = 404;
	serializeErrors() {
    return [{message: this.message}];

  }

}
