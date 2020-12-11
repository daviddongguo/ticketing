import {Listener, Subjects, TicketCreatedEvent} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
		// save data to local tickets collection
		const {id, version, title, price} = data;
		const ticket = Ticket.build({
			id,
			title,
			price,
		});
    await ticket.save();

		// Successfully process an event
		msg.ack();
	}
}
