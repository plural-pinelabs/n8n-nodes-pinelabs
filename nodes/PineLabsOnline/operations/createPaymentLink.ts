import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pineLabsApiRequest,
	validateAmount,
	validateMerchantReference,
	validateExpireBy,
	formatAmountINR,
	getCurrentTimestamp,
} from '../utils';
import { API_ENDPOINTS, DOCUMENTATION_URLS, DEFAULT_VALUES } from '../constants';
import { PAYMENT_METHOD_OPTIONS } from '../enums';
import { Operation } from '../enums/operations';
import type { CreatePaymentLinkRequest, Customer, Address, Amount, ProductDetail } from '../types';

export const createPaymentLinkDescription: INodeProperties[] = [
	// Required Fields
	{
		displayName: 'Amount (Paisa)',
		name: 'amount',
		type: 'number',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: DEFAULT_VALUES.AMOUNT,
		required: true,
		description: 'Payment amount in Paisa (100 paisa = Rs 1). Min: 100 (Rs 1), Max: 100000000 (Rs 10 lakh).',
		typeOptions: {
			minValue: 100,
			maxValue: 100000000,
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: DEFAULT_VALUES.CURRENCY,
		required: true,
		description: 'Currency type for the transaction',
	},
	{
		displayName: 'Merchant Payment Link Reference',
		name: 'merchantPaymentLinkReference',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		required: true,
		description:
			'Unique identifier for the payment link request (1-50 chars, only A-Z, a-z, 0-9, -, _)',
		placeholder: 'payment_link_12345',
	},
	{
		displayName: 'Customer Email',
		name: 'customerEmail',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		required: true,
		placeholder: 'customer@example.com',
		description: "Customer's email address (max 50 chars)",
	},
	{
		displayName: 'Customer First Name',
		name: 'customerFirstName',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		required: true,
		description: "Customer's first name (max 50 chars)",
	},
	{
		displayName: 'Customer Last Name',
		name: 'customerLastName',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		required: true,
		description: "Customer's last name (max 50 chars)",
	},
	{
		displayName: 'Customer Mobile Number',
		name: 'customerMobileNumber',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		required: true,
		placeholder: '9876543210',
		description: "Customer's mobile number (10-20 digits)",
	},
	// Optional Fields (in Additional Options collection)
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description corresponding to the payment',
				placeholder: 'Payment for Order #12345',
			},
			{
				displayName: 'Expire By',
				name: 'expireBy',
				type: 'dateTime',
				default: '',
				description:
					'Expiration timestamp for the payment link (must be within 180 days from now)',
			},
			{
				displayName: 'Allowed Payment Methods',
				name: 'allowedPaymentMethods',
				type: 'multiOptions',
				options: PAYMENT_METHOD_OPTIONS,
				default: [],
				description: 'Payment methods to offer customers',
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				default: DEFAULT_VALUES.COUNTRY_CODE,
				description: 'Country code of the mobile number',
				placeholder: '91',
			},
			{
				displayName: 'Customer ID',
				name: 'customerId',
				type: 'string',
				default: '',
				description: 'Unique identifier of the customer in your system (max 19 chars)',
			},
			{
				displayName: 'GSTIN',
				name: 'gstin',
				type: 'string',
				default: '',
				description: "Customer's GSTIN",
				placeholder: '27AAEPM1234C1Z5',
			},
			{
				displayName: 'Merchant Customer Reference',
				name: 'merchantCustomerReference',
				type: 'string',
				default: '',
				description: 'Unique identifier of the customer for the request (max 50 chars)',
			},
			{
				displayName: 'Billing Address',
				name: 'billingAddress',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Address Line 1',
								name: 'address1',
								type: 'string',
								default: '',
								description: 'Billing address line 1 (max 100 chars)',
							},
							{
								displayName: 'Address Line 2',
								name: 'address2',
								type: 'string',
								default: '',
								description: 'Billing address line 2 (max 100 chars)',
							},
							{
								displayName: 'Address Line 3',
								name: 'address3',
								type: 'string',
								default: '',
								description: 'Billing address line 3 (max 100 chars)',
							},
							{
								displayName: 'Pincode',
								name: 'pincode',
								type: 'string',
								default: '',
								description: 'Pincode (6-10 digits)',
								placeholder: '400001',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								description: 'City (max 50 chars)',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								description: 'State (max 50 chars)',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								description: 'Country (max 50 chars)',
							},
						],
					},
				],
			},
			{
				displayName: 'Shipping Address',
				name: 'shippingAddress',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Address Line 1',
								name: 'address1',
								type: 'string',
								default: '',
								description: 'Shipping address line 1 (max 100 chars)',
							},
							{
								displayName: 'Address Line 2',
								name: 'address2',
								type: 'string',
								default: '',
								description: 'Shipping address line 2 (max 100 chars)',
							},
							{
								displayName: 'Address Line 3',
								name: 'address3',
								type: 'string',
								default: '',
								description: 'Shipping address line 3 (max 100 chars)',
							},
							{
								displayName: 'Pincode',
								name: 'pincode',
								type: 'string',
								default: '',
								description: 'Pincode (6-10 digits)',
								placeholder: '400001',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								description: 'City (max 50 chars)',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								description: 'State (max 50 chars)',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								description: 'Country (max 50 chars)',
							},
						],
					},
				],
			},
			{
				displayName: 'Product Details',
				name: 'productDetails',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Product',
						name: 'product',
						values: [
							{
						displayName: 'Product Amount (Paisa)',
						name: 'productAmount',
						type: 'number',
						default: 0,
						description: 'Product amount in Paisa',
							},
							{
						displayName: 'Product Code',
						name: 'productCode',
						type: 'string',
						default: '',
						description: 'Unique product identifier',
							},
							{
						displayName: 'Product Coupon Currency',
						name: 'productCouponCurrency',
						type: 'string',
						default: '',
						description: 'Currency type for the discount',
							},
							{
						displayName: 'Product Coupon Discount (Paisa)',
						name: 'productCouponDiscount',
						type: 'number',
						default: 0,
						description: 'Discount amount in Paisa',
							},
							{
						displayName: 'Product Currency',
						name: 'productCurrency',
						type: 'string',
						default: '',
						description: 'Currency type for the product',
							},
						],
					},
				],
			},
			{
				displayName: 'Cart Coupon Discount (Paisa)',
				name: 'cartCouponDiscount',
				type: 'number',
				default: 0,
				description: 'Cart-level discount amount in Paisa',
			},
			{
				displayName: 'Cart Coupon Currency',
				name: 'cartCouponCurrency',
				type: 'string',
				default: DEFAULT_VALUES.CURRENCY,
				description: 'Currency type for the cart discount',
			},
			{
				displayName: 'Merchant Metadata',
				name: 'merchantMetadata',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Additional key-value pairs for storing custom information',
				options: [
					{
						displayName: 'Metadata',
						name: 'metadata',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Metadata key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Metadata value',
							},
						],
					},
				],
			},
		],
	},
];

export async function executeCreatePaymentLink(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	// Read required parameters
	const amount = this.getNodeParameter('amount', itemIndex) as number;
	const currency = this.getNodeParameter('currency', itemIndex) as string;
	const merchantPaymentLinkReference = this.getNodeParameter(
		'merchantPaymentLinkReference',
		itemIndex,
	) as string;
	const customerEmail = this.getNodeParameter('customerEmail', itemIndex) as string;
	const customerFirstName = this.getNodeParameter('customerFirstName', itemIndex) as string;
	const customerLastName = this.getNodeParameter('customerLastName', itemIndex) as string;
	const customerMobileNumber = this.getNodeParameter('customerMobileNumber', itemIndex) as string;

	// Validate required fields
	validateAmount(amount);
	validateMerchantReference(merchantPaymentLinkReference);

	// Read optional parameters
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;

	// Validate expire_by if provided
	if (additionalOptions.expireBy) {
		validateExpireBy(additionalOptions.expireBy as string);
	}

	// Build customer object
	const customer: Customer = {
		email_id: customerEmail,
		first_name: customerFirstName,
		last_name: customerLastName,
		mobile_number: customerMobileNumber,
	};

	// Add optional customer fields
	if (additionalOptions.countryCode) {
		customer.country_code = additionalOptions.countryCode as string;
	}
	if (additionalOptions.customerId) {
		customer.customer_id = additionalOptions.customerId as string;
	}
	if (additionalOptions.gstin) {
		customer.gstin = additionalOptions.gstin as string;
	}
	if (additionalOptions.merchantCustomerReference) {
		customer.merchant_customer_reference = additionalOptions.merchantCustomerReference as string;
	}

	// Add billing address if provided
	if (additionalOptions.billingAddress) {
		const billingData = additionalOptions.billingAddress as IDataObject;
		if (billingData.address) {
			const addr = billingData.address as IDataObject;
			const billingAddress: Address = {};
			if (addr.address1) billingAddress.address1 = addr.address1 as string;
			if (addr.address2) billingAddress.address2 = addr.address2 as string;
			if (addr.address3) billingAddress.address3 = addr.address3 as string;
			if (addr.pincode) billingAddress.pincode = addr.pincode as string;
			if (addr.city) billingAddress.city = addr.city as string;
			if (addr.state) billingAddress.state = addr.state as string;
			if (addr.country) billingAddress.country = addr.country as string;
			customer.billing_address = billingAddress;
		}
	}

	// Add shipping address if provided
	if (additionalOptions.shippingAddress) {
		const shippingData = additionalOptions.shippingAddress as IDataObject;
		if (shippingData.address) {
			const addr = shippingData.address as IDataObject;
			const shippingAddress: Address = {};
			if (addr.address1) shippingAddress.address1 = addr.address1 as string;
			if (addr.address2) shippingAddress.address2 = addr.address2 as string;
			if (addr.address3) shippingAddress.address3 = addr.address3 as string;
			if (addr.pincode) shippingAddress.pincode = addr.pincode as string;
			if (addr.city) shippingAddress.city = addr.city as string;
			if (addr.state) shippingAddress.state = addr.state as string;
			if (addr.country) shippingAddress.country = addr.country as string;
			customer.shipping_address = shippingAddress;
		}
	}

	// Build request body
	const amountObj: Amount = {
		value: amount,
		currency,
	};

	const requestBody: CreatePaymentLinkRequest = {
		amount: amountObj,
		merchant_payment_link_reference: merchantPaymentLinkReference,
		customer,
	};

	// Add optional fields to request body
	if (additionalOptions.description) {
		requestBody.description = additionalOptions.description as string;
	}
	if (additionalOptions.expireBy) {
		requestBody.expire_by = additionalOptions.expireBy as string;
	}
	if (additionalOptions.allowedPaymentMethods) {
		const methods = additionalOptions.allowedPaymentMethods as string[];
		requestBody.allowed_payment_methods = methods.join(',');
	}

	// Add product details if provided
	if (additionalOptions.productDetails) {
		const productData = additionalOptions.productDetails as IDataObject;
		if (productData.product && Array.isArray(productData.product)) {
			const products: ProductDetail[] = [];
			for (const prod of productData.product) {
				const product: ProductDetail = {};
				if (prod.productCode) product.product_code = prod.productCode as string;
				if (prod.productAmount) {
					product.product_amount = {
						value: prod.productAmount as number,
						currency: (prod.productCurrency as string) || DEFAULT_VALUES.CURRENCY,
					};
				}
				if (prod.productCouponDiscount) {
					product.product_coupon_discount_amount = {
						value: prod.productCouponDiscount as number,
						currency: (prod.productCouponCurrency as string) || DEFAULT_VALUES.CURRENCY,
					};
				}
				products.push(product);
			}
			requestBody.product_details = products;
		}
	}

	// Add cart coupon discount if provided
	if (additionalOptions.cartCouponDiscount) {
		requestBody.cart_coupon_discount_amount = {
			value: additionalOptions.cartCouponDiscount as number,
			currency: (additionalOptions.cartCouponCurrency as string) || DEFAULT_VALUES.CURRENCY,
		};
	}

	// Add merchant metadata if provided
	if (additionalOptions.merchantMetadata) {
		const metadataData = additionalOptions.merchantMetadata as IDataObject;
		if (metadataData.metadata && Array.isArray(metadataData.metadata)) {
			const metadata: Record<string, string> = {};
			for (const item of metadataData.metadata) {
				if (item.key && item.value) {
					metadata[item.key as string] = item.value as string;
				}
			}
			requestBody.merchant_metadata = metadata;
		}
	}

	// Make API request
	const response = await pineLabsApiRequest(
		this,
		'POST',
		API_ENDPOINTS.PAYMENT_LINK,
		requestBody,
		itemIndex,
	);

	// Enrich response
	const enrichedResponse = {
		...response,
		_amount_formatted: response?.amount?.value
			? formatAmountINR(response.amount.value)
			: undefined,
		_api_info: {
			endpoint: API_ENDPOINTS.PAYMENT_LINK,
			documentation: DOCUMENTATION_URLS.CREATE_PAYMENT_LINK,
			timestamp: getCurrentTimestamp(),
		},
	};

	return enrichedResponse as IDataObject;
}
