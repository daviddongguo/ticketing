import mongoose from 'mongoose';
import {Payment} from '../payment';

const paymentBuild = () => {
	return Payment.build({
		orderId: mongoose.Types.ObjectId().toHexString(),
		stripeId: mongoose.Types.ObjectId().toHexString(),
	});
};

it('toJSON', async () => {
  const payment = await paymentBuild().save();
	const json = JSON.stringify(payment);

	expect(json).not.toContain('_id');
	expect(json).not.toContain('__v');
  expect(json).toContain('"id"');

});



it('updates an payment successfully', async () => {
  const payment = await paymentBuild().save();
  const oldStripeId = payment.stripeId;
  const newStripeId = mongoose.Types.ObjectId().toHexString();

  const updatedPayment = payment.set({stripeId: newStripeId})
  await updatedPayment.save();
	expect(updatedPayment.stripeId).not.toEqual(oldStripeId);
	expect(updatedPayment.stripeId).toEqual(newStripeId);
});


