import {Ticket} from '../ticket';

it('implements optimistic concurrency control', async (done) => {
	// Create an instance of a ticket
	const title = 'a title for event';
	const ticket = Ticket.build({
		title,
		price: 2.99,
		userId: 'auseridlikethis',
	});

	// Save the ticket to the database
	await ticket.save();

	// fetch the ticket twice
	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	// make two separate changes to the tickets we fetched
	firstInstance!.set({price: 3.0});
	firstInstance!.set({price: 1.0});

	// save the first fethed ticket
	await firstInstance!.save();

	// save the second fetched ticket and expect an error
	try {
		await secondInstance!.save();
	} catch (error) {
    console.error(error.Message);
    return done();
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async()=>{
  	// Create an instance of a ticket
	const title = 'a title for event';
	const ticket = Ticket.build({
		title,
		price: 2.99,
		userId: 'auseridlikethis',
	});

	// Save the ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);

});
