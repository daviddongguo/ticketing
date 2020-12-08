
import {Publisher, Subjects, TicketCreatedEvent} from '@davidgarden/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
