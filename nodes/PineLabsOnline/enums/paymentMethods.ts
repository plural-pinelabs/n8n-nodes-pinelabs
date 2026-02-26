export enum PaymentMethod {
	CARD = 'CARD',
	UPI = 'UPI',
	POINTS = 'POINTS',
	NETBANKING = 'NETBANKING',
	WALLET = 'WALLET',
	CREDIT_EMI = 'CREDIT_EMI',
	DEBIT_EMI = 'DEBIT_EMI',
}

export const PAYMENT_METHOD_OPTIONS = [
	{ name: 'Card', value: PaymentMethod.CARD },
	{ name: 'UPI', value: PaymentMethod.UPI },
	{ name: 'Points', value: PaymentMethod.POINTS },
	{ name: 'Net Banking', value: PaymentMethod.NETBANKING },
	{ name: 'Wallet', value: PaymentMethod.WALLET },
	{ name: 'Credit EMI', value: PaymentMethod.CREDIT_EMI },
	{ name: 'Debit EMI', value: PaymentMethod.DEBIT_EMI },
];
