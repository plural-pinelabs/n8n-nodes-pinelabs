export enum Resource {
	PAYMENT_LINK = 'paymentLink',
	ORDER = 'order',
}

export enum Operation {
	CREATE_PAYMENT_LINK = 'createPaymentLink',
	GET_PAYMENT_LINK = 'getPaymentLink',
	CREATE_ORDER = 'createOrder',
	GET_ORDER = 'getOrder',
}

export const PAYMENT_LINK_OPERATIONS = [
	{
		name: 'Create',
		value: Operation.CREATE_PAYMENT_LINK,
		description: 'Create a payment link and send it to the customer',
		action: 'Create a payment link',
	},
	{
		name: 'Get',
		value: Operation.GET_PAYMENT_LINK,
		description: 'Fetch a payment link by its Payment Link ID',
		action: 'Get a payment link',
	},
];

export const ORDER_OPERATIONS = [
	{
		name: 'Create',
		value: Operation.CREATE_ORDER,
		description: 'Create an order to initiate a payment',
		action: 'Create an order',
	},
	{
		name: 'Get',
		value: Operation.GET_ORDER,
		description: 'Fetch an order by its Order ID',
		action: 'Get an order',
	},
];
