import {Listener, NotFoundError, Subjects, TicketUpdatedEvent} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message){
    // save data to local tickets collection
    const dbTicket = await Ticket.findByEvent(data);
    if(!dbTicket){
      throw new NotFoundError('Ticket(id=${id})');
    }
    const {title, price, version} = data;
    dbTicket.set({title, price, version});
    await dbTicket.save();

    // Successfully process an event
    msg.ack();
  }
}
