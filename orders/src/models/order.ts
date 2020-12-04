import mongoose from 'mongoose';

interface OrderAttrs {
	userId: string;
  ticketId: string;
  status: string;
  expiresAt: string;
}

interface OrderDoc extends mongoose.Document {
	orderId: string;
	userId: string;
  ticketId: string;
  status: string;
  expiresAt: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
}

const todayStr: string = new Date().toISOString().slice(0, 10);

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		ticketId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
      required: true,
      default: 'pending',
		},
		ExpiresAt: {
			type: String,
			required: true,
			default: todayStr,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	}
);

// -2  Define function then create mode
orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs);
};

// -1  Create the actual model
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);



export {Order, OrderDoc};

