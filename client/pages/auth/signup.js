import axios from 'axios';
import {useState} from 'react';
import SERVER_URL from '../../config';
const signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const onSubmit = async (event) => {
		event.preventDefault();
		console.log('env: ' + process.env.REACT_ENV);
		console.log(SERVER_URL);

		const url = SERVER_URL + '/api/users/signup';
		console.log(url);
		try {
			const response = await axios.post(url, {
				email,
				password,
			});
			console.log(response.body);
		} catch (error) {
			console.error(error);
		}
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
				<button className='btn btn-primary'>Sign Up</button>
			</div>
		</form>
	);
};

export default signup;
