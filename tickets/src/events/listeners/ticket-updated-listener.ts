
import {Listener, Subjects, TicketUpdatedEvent} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}


