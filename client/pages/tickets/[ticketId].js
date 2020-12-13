import Router from 'next/router';
import {useEffect, useState} from 'react';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ticket}) => {
	const {isReserved, SetIsReserved} = useState(false);
	useEffect(() => {
		if (ticket.orderId) {
			SetIsReserved(true);
		}
	});
	const {doRequest, errorsComponent} = useRequest({
		url: '/api/orders',
		method: 'post',
		body: {ticketId: ticket.id},
		onSuccess: (order) =>
			Router.push('/orders/[orderId]', `/orders/${order.id}`),
	});

	const onClick = (event) => {
		event.preventDefault();
		doRequest();
	};

	return (
		<div>
			<h3>title: {ticket.title}</h3>
			<h4>price: {ticket.price}</h4>
			<h4>id: {ticket.id}</h4>
			<h4>version: {ticket.version}</h4>
			<h4>order id:{ticket.orderId}</h4>
			{errorsComponent}
			<button
				disabled={isReserved}
				onClick={onClick}
				className='btn btn-primary'
			>
				Purchase
			</button>
		</div>
	);
};

TicketShow.getInitialProps = async (context, client) => {
	const {ticketId} = context.query;
	const {data} = await client.get(`/api/tickets/${ticketId}`);
	return {ticket: data.tickets[0]};
};

export default TicketShow;
