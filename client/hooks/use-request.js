import axios from 'axios';
import {useState} from 'react';

const useRequest = ({url, method, body, onSuccess}) => {
	const [errorsComponent, setErrorsComponent] = useState(null);

	const doRequest = async (props = {}) => {
		try {
			setErrorsComponent(null);
			const response = await axios[method](process.env.serverBaseUrl + url, {
				...body,
				...props,
			});
			if (onSuccess) {
				onSuccess(response.data);
			}
			return response.data;
		} catch (error) {
			let list = [];
			if (error.response) {
				error.response.data.errors.map((err) => {
					list.push(err.message);
				});
			} else {
				if (error.message) {
					list.push(error.message);
				} else {
					list.push('Something broke!');
				}
			}

			setErrorsComponent(
				<div className='alert alert-danger'>
					<h4>Oops...</h4>
					<ul className='my-0'>
						{list.map((err) => {
							return <li key={err}>{err}</li>;
						})}
					</ul>
				</div>
			);
		}
	};

	return {doRequest, errorsComponent};
};

export default useRequest;
