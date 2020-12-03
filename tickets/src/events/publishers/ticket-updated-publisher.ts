import {Publisher, Subjects, TicketUpdatedEvent} from '@davidgarden/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
