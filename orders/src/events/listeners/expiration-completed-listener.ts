import {
  ExpirationCompleteEvent,
  Listener,
  NotFoundError,
  OrderStatus,
  Subjects
} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';
import {OrderCancelledPublisher} from '../publishers/order-cancelled-publisher';
import {queueGroupName} from './queue-group-name';

export class ExpirationCompletedListener extends Listener<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
	queueGroupName = queueGroupName;

	async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
		// update the order locally
		const dbOrder = await Order.findById(data.orderId).populate('ticket');
		if (!dbOrder) {
			throw new NotFoundError(`Order(id=${data.orderId})`);
    }
    if(dbOrder.status === OrderStatus.Complete){
      return msg.ack();
    }
		dbOrder.set({status: OrderStatus.Cancelled});
		await dbOrder.save();
		// publish an event saying this order was cancelled!
    await new OrderCancelledPublisher(this.client).publish({
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
