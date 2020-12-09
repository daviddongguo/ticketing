import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  status: OrderStatus;
  vesion: number;
  userId: string;
  price: number;
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus;
  vesion: number;
  userId: string;
  price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
	{
		status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    userId: {
			type: String,
			required: true,
		},
    price: {
			type: Number,
			required: true,
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
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

// -2  Define function then create mode
orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order({
    _id: attrs.id,
    status: attrs.status,
    version: attrs.vesion,
    userId: attrs.userId,
    price: attrs.price,

  });
};

// -1  Create the actual model
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order, OrderDoc};

