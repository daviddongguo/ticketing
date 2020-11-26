import Router from 'next/router';
import {useEffect} from 'react';
import useReQuest from '../../hooks/use-request';
const SignOut = () => {
	const {doRequest} = useReQuest({
		url: '/api/users/currentuser',
		method: 'post',
		body: {},
		onSuccess: () => Router.push('/'),
	});

	useEffect(() => {
		doRequest();
	}, []);
	return <div>Signing you out...</div>;
};

export default SignOut;
