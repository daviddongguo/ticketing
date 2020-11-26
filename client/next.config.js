module.exports = {
	webpackDevMiddleware: (config) => {
		config.watchOptions.poll = 300;
		return config;
	},
	env: {
		serverBaseUrl: process.env.SERVER_URL || 'https://ticketing.dev',
	},
};
