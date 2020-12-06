import {Listener, NotFoundError, Subjects, TicketUpdatedEvent} from '@davidgarden/common';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message){
    // save data to local tickets collection
    const {id, title, price} = data;
    const dbTicket = await Ticket.findById(id);
    if(!dbTicket){
      throw new NotFoundError('Ticket(id=${id})');
    }
    dbTicket.set({title, price});
    await dbTicket.save();

    // Successfully process an event
    msg.ack();
  }
}
