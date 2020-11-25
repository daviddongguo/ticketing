import axios from 'axios';
import {useState} from 'react';

const useRequest = ({url, method, body}) => {
	const [errorsComponent, setErrorsComponent] = useState(null);

	const doRequest = async () => {
		try {
			setErrorsComponent(null);
			const response = await axios[method](
				process.env.serverBaseUrl + url,
				body
			);
			return response.data;
		} catch (error) {
			setErrorsComponent(
				<div className='alert alert-danger'>
					<h4>Oops...</h4>
					<ul className='my-0'>
						{error.response.data.errors.map((err) => (
							<li key={err.message}>{err.message}</li>
						))}
					</ul>
				</div>
			);
		}
	};

	return {doRequest, errorsComponent};
};

export default useRequest;
