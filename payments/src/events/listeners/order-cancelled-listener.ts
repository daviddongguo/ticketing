import {
  Listener,
  NotFoundError,
  OrderCancelledEvent, OrderStatus, Subjects
} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';
import {DatabaseConnectionError} from './../../../../common/src/errors/database-connection-error';
import {queueGroupName} from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		// Find the order and update it
		const dbOrder = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
		if (!dbOrder) {
			throw new NotFoundError(`Order(_id=${data.id})`);
    }

    try {
      dbOrder.set({status: OrderStatus.Cancelled});
      await dbOrder.save();
      console.log('save dbOrder \n', dbOrder);

    } catch (error) {
      throw new DatabaseConnectionError("Ooops!");
    }



		msg.ack();
	}
}
