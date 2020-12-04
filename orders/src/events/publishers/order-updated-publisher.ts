import {OrderUpdatedEvent, Publisher, Subjects} from '@davidgarden/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
	readonly subject = Subjects.OrderUpdated;
}
