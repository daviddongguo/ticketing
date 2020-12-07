import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  Subjects
} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../models/ticket';
import {TicketUpdatedPublisher} from '../publishers/ticket-updated-publisher';
import {queueGroupName} from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		// Find the ticket that the order is reserving.
		const dbTicket = await Ticket.findById(data.ticket.id);
		if (!dbTicket) {
			throw new NotFoundError(`Ticket(id=${data.ticket.id})`);
		}

		// Mark the ticket as being reserved by setting its orderId property
		// Save the ticket
		dbTicket.set({orderId: undefined});
		await dbTicket.save();
		// Publish ticket updated event
		await new TicketUpdatedPublisher(this.client).publish({
			id: dbTicket.id,
			version: dbTicket.version,
			title: dbTicket.title,
			price: dbTicket.price,
			userId: dbTicket.userId,
			orderId: dbTicket.orderId,
		});

		msg.ack();
	}
}
