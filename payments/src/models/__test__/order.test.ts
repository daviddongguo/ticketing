import {NotFoundError, OrderStatus} from '@davidgarden/common';
import mongoose from 'mongoose';
import {Order, OrderDoc} from '../order';

const orderBuild = (version?: number) => {
	return Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version,
		userId: mongoose.Types.ObjectId().toHexString(),
		price: 1.99,
	});
};

it('renames _id to noramal id', () => {
	const json = JSON.stringify(orderBuild());
	expect(json).not.toContain('_id');
	expect(json).toContain('"id"');
});

it('can not increase version automatically', async () => {
	const version = 0;
	const order = await orderBuild().save();
	expect(order.version).toEqual(version);
	await order.save();
	expect(order.version).toEqual(version);
});

it('throw DocumentNotFoundError', async () => {
	const version = 123;
	const order = orderBuild(version);
	try {
		await order.save();
	} catch (error) {
		expect(error).toBeDefined();
	}
});

it('intial vesion is disabled', async () => {
	const version = 123;
	const order = orderBuild(version);
	await order.save();
	expect(order.version).not.toEqual(version);
	expect(order.version).toEqual(0);
});

it('updates an order successfully', async () => {
	const order = await orderBuild().save();
  expect(order.version).toEqual(0);
  let updatedOrder = await orderUpdate(order);
	expect(updatedOrder.id).toEqual(order.id);
  expect(updatedOrder.version).toEqual(order.version + 1);

  updatedOrder = await orderUpdate(updatedOrder);
	expect(updatedOrder.id).toEqual(order.id);
	expect(updatedOrder.version).toEqual(order.version + 2);
});

it('fail to update an order with wrong version', async () => {
	const order = await orderBuild().save();
  expect(order.version).toEqual(0);
  try {
    await orderUpdate(order, 123);
  } catch (error) {
    expect(error).toBeDefined();
  }
});

const orderUpdate = async (order: OrderDoc, version?: number) => {
	const dbOrder = await Order.findByEvent({
		id: order.id,
		version: version || order.version + 1,
  });
  if (!dbOrder) {
		throw new NotFoundError("order not found.");;
	}
	dbOrder.set({
		version: version || order.version + 1,
	});
  await dbOrder.save();

  return dbOrder;
};
