import {PaymentCreatedEvent, Publisher, Subjects} from '@davidgarden/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated;
};
