import nats from 'node-nats-streaming';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  // use loadBalance
	url: 'http://35.196.98.224:4222',
});

stan.on('connect', () => {
  console.log('Publisher connected to NATS');

  const data = JSON.stringify({
    id: 'adafd',
    title: 'concert',
    price: 20
  });

  stan.publish('ticket:created', data, ()=>{
    console.log('Event published.');
  });
});
