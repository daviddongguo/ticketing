import {
  DatabaseConnectionError,
  Listener,
  NotFoundError,
  OrderCancelledEvent, OrderStatus, Subjects
} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';
import {queueGroupName} from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		// Find the order and update it
		const dbOrder = await Order.findByEvent(data);
		if (!dbOrder) {
			throw new NotFoundError(`Order(_id=${data.id}, version=${data.version})`);
    }

    try {
      dbOrder.set({status: OrderStatus.Cancelled});
      await dbOrder.save();
    } catch (error) {
      // throw error;
      throw new DatabaseConnectionError("Ooops!");
    }

		msg.ack();
	}
}
