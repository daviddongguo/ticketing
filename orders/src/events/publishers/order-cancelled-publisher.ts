import {OrderCancelledEvent, Publisher, Subjects} from '@davidgarden/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}

