import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

interface TicketAttrs {
	title: string;
	price: number;
	userId: string;
}

interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	userId: string;
  createAt: string;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
}

const todayStr: string = new Date().toISOString().slice(0, 10);

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		createAt: {
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// -2  Define function then create mode
ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket(attrs);
};

// -1  Create the actual model
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);



export {Ticket, TicketDoc};

