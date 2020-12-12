import Link from 'next/link';

const OrderIndex = ({currentUser, orders}) => {
	const ordersList = orders.map((order) => {
		return (
			<tr key={order.id}>
				<td>{order.status}</td>
				<td>{order.version}</td>
				<td>
					<Link href='/tickets/[ticketId]' as={`/tickets/${order.ticket.id}`}>
						<a>{order.ticket.title}</a>
					</Link>
				</td>
				<td>{order.ticket.price}</td>
				<td>
					<Link href='/orders/[orderId]' as={`/orders/${order.id}`}>
						<a>View</a>
					</Link>
				</td>
			</tr>
		);
	});

	return (
		<div>
			<h1>Orders</h1>
			<table className='table'>
				<thead>
					<tr>
						<th>Status</th>
						<th>Version</th>
						<th>Title</th>
						<th>Price</th>
						<th>Link</th>
					</tr>
				</thead>
				<tbody>{ordersList}</tbody>
			</table>
		</div>
	);
};

OrderIndex.getInitialProps = async (context, client, currentUser) => {
	try {
		const {data} = await client.get('/api/orders');
		return {orders: data.orders};
	} catch (error) {
		return {orders: []};
	}
};

export default OrderIndex;
