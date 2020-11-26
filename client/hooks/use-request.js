import axios from 'axios';
import {useState} from 'react';

const useRequest = ({url, method, body, onSuccess}) => {
	const [errorsComponent, setErrorsComponent] = useState(null);

	const doRequest = async () => {
		try {
			setErrorsComponent(null);
			const response = await axios[method](
				process.env.serverBaseUrl + url,
				body
			);
			if (onSuccess) {
				onSuccess(response.data);
			}
			return response.data;
		} catch (error) {
			setErrorsComponent(
				<div className='alert alert-danger'>
					<h4>Oops...</h4>
					<ul className='my-0'>
						if(error.response.data.errors)
						{error.response.data.errors.map((err) => (
							<li key={err.message}>{err.message}</li>
						))}
						else
						{<li>Something broke!</li>}
					</ul>
				</div>
			);
		}
	};

	return {doRequest, errorsComponent};
};

export default useRequest;
