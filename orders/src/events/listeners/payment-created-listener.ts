import {
  Listener,
  NotFoundError,
  OrderStatus, PaymentCreatedEvent,
  Subjects
} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';
import {OrderUpdatedPublisher} from '../publishers/order-updated-publisher';
import {queueGroupName} from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		// update the order locally
		const dbOrder = await Order.findById(data.orderId).populate('ticket');
		if (!dbOrder) {
			throw new NotFoundError(`Order(id=${data.orderId})`);
    }

		dbOrder.set({status: OrderStatus.Complete});
		await dbOrder.save();
		// publish an event saying this order was updated!
    await new OrderUpdatedPublisher(this.client).publish({
			id: dbOrder.id,
			version: dbOrder.version,
			ticket: {
				id: dbOrder.ticket.id,
			},
		});

		// Successfully process an event
		msg.ack();
	}
}
