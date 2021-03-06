import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';
import {TicketDoc} from './ticket';

interface OrderAttrs {
	userId: string;
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
  paymentId?: string;
}

interface OrderDoc extends mongoose.Document {
  id: string,
	userId: string;
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
  paymentId?: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
			required: true,
		},
		status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
		},
		expiresAt: {
			type: mongoose.Schema.Types.Date,
			required: true,
    },
    paymentId:{
      type: String,
    },
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

// -2  Define function then create mode
orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs);
};

// -1  Create the actual model
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);



export {Order, OrderDoc};

