export const API_BASE_URLS = {
	UAT: 'https://pluraluat.v2.pinepg.in/api',
	PRODUCTION: 'https://api.pluralpay.in/api',
} as const;

export const API_ENDPOINTS = {
	GENERATE_TOKEN: '/auth/v1/token',
	PAYMENT_LINK: '/pay/v1/paymentlink',
	ORDERS: '/checkout/v1/orders',
	GET_ORDER: '/pay/v1/orders'
} as const;

export const DOCUMENTATION_URLS = {
	CREATE_PAYMENT_LINK:
		'https://developer.pinelabsonline.com/reference/payment-link-create',
	GET_PAYMENT_LINK:
		'https://developer.pinelabsonline.com/reference/payment-link-get-by-payment-link-id',
	CREATE_ORDER: 'https://developer.pinelabsonline.com/reference/orders-create',
	GET_ORDER: 'https://developer.pinelabsonline.com/reference/orders-get-by-order-id',
} as const;

export const VALIDATION_LIMITS = {
	MIN_AMOUNT: 100,
	MAX_AMOUNT: 100000000,
	MAX_MERCHANT_REF_LENGTH: 50,
	MIN_MERCHANT_REF_LENGTH: 1,
	MAX_PAYMENT_LINK_ID_LENGTH: 50,
	MAX_ORDER_ID_LENGTH: 50,
	MAX_EXPIRE_DAYS: 180,
} as const;

export const ERROR_MESSAGES = {
	MIN_AMOUNT: 'Amount must be at least Rs 1 (100 paisa)',
	MAX_AMOUNT: 'Amount must not exceed Rs 10,00,000 (100000000 paisa)',
	INVALID_MERCHANT_REF:
		'Merchant reference must be 1-50 characters, only A-Z, a-z, 0-9, - and _ allowed',
	TOKEN_GENERATION_FAILED:
		'Failed to generate Pine Labs access token. Check your Client ID and Secret',
	INVALID_PAYMENT_LINK_ID: 'Payment Link ID is required and must not exceed 50 characters',
	INVALID_ORDER_ID: 'Order ID is required and must not exceed 50 characters',
	INVALID_EXPIRE_BY: 'Expiry timestamp must be within 180 days from now',
} as const;

export const NODE_CONFIG = {
	DISPLAY_NAME: 'Pine Labs Online',
	NAME: 'pineLabsOnline',
	ICON: 'file:Pine_Labs_Online_Logo.svg',
	GROUP: ['transform'] as string[],
	VERSION: 1,
	SUBTITLE: '={{$parameter["operation"]}}',
	DESCRIPTION: 'Create and manage Pine Labs Online Pay by Link payment links and orders',
	CREDENTIAL_NAME: 'pineLabsOnlineApi',
} as const;

export const DEFAULT_VALUES = {
	CURRENCY: 'INR',
	AMOUNT: 10000,
	COUNTRY_CODE: '91',
} as const;
