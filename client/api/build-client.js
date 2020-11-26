import axios from 'axios';

const buildClient = ({req}) => {
	if (typeof window === 'undefined') {
		// we are on the server!
		// const isServer = !!req

		console.log(process.env.serverBaseUrl);
		return axios.create({
			baseURL:
				process.env.serverBaseUrl !== ''
					? process.env.serverBaseUrl
					: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers,
		});
	} else {
		// we are on the browser!
		// const isBrowser = !req
		return axios.create({
			baseURL: process.env.serverBaseUrl,
			// baseURL: 'http://localhost:3018',
		});
	}
};

export default buildClient;
