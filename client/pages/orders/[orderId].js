import {useEffect, useState} from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({order, currentUser}) => {
	const [timeLeft, setTimeLeft] = useState('');

	const {doRequest, errorsComponent} = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: (payment) => console.log(payment),
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};

		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, []);

	if (timeLeft <= 0 || order.status === 'complete') {
		return (
			<div>
				<h4>status: {order.status}</h4>
				<h4>version: {order.version}</h4>
			</div>
		);
	}

	return (
		<div>
			<h4>Time left to pay: {timeLeft} seconds</h4>
			<StripeCheckout
				token={({id}) => doRequest({token: id})}
				stripeKey='pk_test_51HwgiiGvSCBSby0UDOvmSODuHGcjZwCTx2Gdt8IOuqdtfdHE2khPDhHtnK642jNINLzNv59rY9xl39BDit6I7qvN00nieA93eW'
				amount={order.ticket.price * 100}
				email={currentUser.email}
			/>
			{errorsComponent}

			<h3>{order.ticket.title}</h3>
			<h4>{order.ticket.price}</h4>
			<h4>{order.status}</h4>
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const {orderId} = context.query;
	const {data} = await client.get(`/api/orders/${orderId}`);
	return {order: data.orders[0]};
};

export default OrderShow;
