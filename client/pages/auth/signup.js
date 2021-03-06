import Router from 'next/router';
import {useState} from 'react';
import useRequest from '../../hooks/use-request';

const signup = () => {
	const [email, setEmail] = useState('test@email.com');
	const [password, setPassword] = useState('test');
	const {doRequest, errorsComponent} = useRequest({
		url: '/api/users/signup',
		method: 'post',
		body: {
			email,
			password,
		},
		onSuccess: () => Router.push('/'),
	});
	const onSubmit = async (event) => {
		event.preventDefault();
		await doRequest();
	};

	return (
		<form onSubmit={onSubmit}>
			<h1>Sign Up</h1>
			<div className='form-group'>
				<label>Email</label>
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className='form-control'
				/>
				<label>Password</label>
				<input
					type='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className='form-control'
				/>
				{errorsComponent}
				<button className='btn btn-primary'>Sign Up</button>
			</div>
		</form>
	);
};

export default signup;
