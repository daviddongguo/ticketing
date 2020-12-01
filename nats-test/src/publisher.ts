import nats from 'node-nats-streaming';

const stan = nats.connect('ticketing', 'abc', {
  // use loadBalance
	url: 'http://35.196.98.224:4222',
	// url: 'http://34.75.134.1135.196.98.224108/',
	// url: 'http://ticketing.dev:4222/api/v1/proxy/namespaces/default/services/nats-srv:http/'
});

stan.on('connect', () => {
	console.log('Publisher connected to NATS');
});
