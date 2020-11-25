import axios from 'axios';
import {useState} from 'react';
const signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState([]);

	const onSubmit = async (event) => {
		event.preventDefault();
		const url = process.env.baseUrl + '/api/users/signup';
		console.log(url);
		try {
			const response = await axios.post(url, {
				email,
				password,
			});
			console.table(response.data);
			setErrors([]);
		} catch (error) {
			setErrors(error.response.data.errors);
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
				{errors.length > 0 && (
					<div className='alert alert-danger'>
						<h4>Oops...</h4>
						<ul className='my-0'>
							{errors.map((err) => (
								<li key={err.message}>{err.message}</li>
							))}
						</ul>
					</div>
				)}
				<button className='btn btn-primary'>Sign Up</button>
			</div>
		</form>
	);
};

export default signup;
