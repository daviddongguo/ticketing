import {OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
	findByEvent(event: {id: string; version: number}): Promise<OrderDoc | null>;
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

orderSchema.pre('save', function(done){
  // @ts-ignore
  this.$where = {
    version: this.get('version') -1
  };
  done();
});

orderSchema.statics.findByEvent = (event: {id: string; version: number}) => {
	return Order.findOne({
		_id: event.id,
		version: event.version - 1,
	});
};

// -2  Define function then create mode
orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order({
    _id: attrs.id,
    status: attrs.status,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,

  });
};

// -1  Create the actual model
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order, OrderDoc};

