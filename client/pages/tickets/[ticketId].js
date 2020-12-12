import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ticket}) => {
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
			<h3>{ticket.title}</h3>
			<h4>{ticket.price}</h4>
			{errorsComponent}
			<button onClick={onClick} className='btn btn-primary'>
				Purchase
			</button>
		</div>
	);
};

TicketShow.getInitialProps = async (context, client) => {
	const {ticketId} = context.query;
	const {data} = await client.get(`/api/tickets/${ticketIdk}`);
	return {ticket: data.tickets[0]};
};

export default TicketShow;
