export const STRIPE_ID = 'a-stripe-id';
export const stripe = {
	charges: {
		create: jest
			.fn()
			.mockImplementation(
				(
					amount: number,
					currency: string,
					source: string,
					descript: string
				) => {
					return new Promise(function (Resolve, Reject) {
						Resolve({id: STRIPE_ID});
					});
				}
			),
	},
};
