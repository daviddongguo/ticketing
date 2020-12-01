import nats from 'node-nats-streaming';
console.clear();

const stan = nats.connect('ticketing', '123', {
	url: 'http://35.196.98.224:4222',
});

stan.on('connect', ()=>{
  console.log('Listener connected to NATS');

  const subscription = stan.subscribe('ticket:created');

  subscription.on('message', (msg)=>{
    console.log('Message received.');
    console.log(msg);

  });




});
