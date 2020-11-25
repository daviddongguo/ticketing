import {useState} from 'react';
import useRequest from '../../hooks/use-request';

const signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const {doRequest, errors} = useRequest({
		url: '/api/users/signup',
		method: 'post',
		body: {
			email,
			password,
		},
	});
	const onSubmit = async (event) => {
		event.preventDefault();
		doRequest();
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
				{errors}
				<button className='btn btn-primary'>Sign Up</button>
			</div>
		</form>
	);
};

export default signup;
