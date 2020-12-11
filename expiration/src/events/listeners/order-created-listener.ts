import {Listener, OrderCreatedEvent, Subjects} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {expirationQueue} from '../../queues/expiration-queue';
import {queueGroupName} from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add(
			{orderId: data.id},
			{
        //FIXME: retain 15 minutes
				delay: delay - 800000,
			}
		);

		msg.ack();
	}
}
