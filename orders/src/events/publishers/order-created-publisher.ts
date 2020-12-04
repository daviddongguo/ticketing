
import {OrderCreatedEvent, Publisher, Subjects} from '@davidgarden/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
