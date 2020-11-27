import Router from 'next/router';
import {useEffect} from 'react';
import useReQuest from '../../hooks/use-request';
const signout = () => {
	const {doRequest} = useReQuest({
		url: '/api/users/signout',
		method: 'post',
		body: {},
		onSuccess: () => Router.push('/'),
	});

	useEffect(() => {
		doRequest();
	}, []);
	return <div>Signing you out...</div>;
};

export default signout;
