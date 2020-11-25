module.exports = {
	webpackDevMiddleware: (config) => {
		config.watchOptions.poll = 300;
		return config;
	},
	env: {
		baseUrl: process.env.SERVER_URL || '',
	},
};
