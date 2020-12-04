module.exports = {
	localDb:
    'mongodb://127.0.0.1/tickets',
  googleDb: process.env.MONGO_URI,
  cluserId: process.env.CLUSERT_ID,
  clientId: process.env.CLIENT_ID,
  natsUrl: process.env.NATS_URL,
};
