import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pineLabsApiRequest,
	validateAmount,
	validateMerchantReference,
	formatAmountINR,
	getCurrentTimestamp,
} from '../utils';
import { API_ENDPOINTS, DOCUMENTATION_URLS, DEFAULT_VALUES } from '../constants';
import { PAYMENT_METHOD_OPTIONS } from '../enums';
import { Operation } from '../enums/operations';
import type { Amount, CreateOrderRequest, Customer, Address, PurchaseDetails } from '../types';

export const createOrderDescription: INodeProperties[] = [
	// Required fields
	{
		displayName: 'Order Amount (Paisa)',
		name: 'orderAmount',
		type: 'number',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_ORDER],
			},
		},
		default: DEFAULT_VALUES.AMOUNT,
		required: true,
		description:
			'Order amount in Paisa (100 paisa = Rs 1). Min: 100 (Rs 1), Max: 100000000 (Rs 10 lakh).',
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
				operation: [Operation.CREATE_ORDER],
			},
		},
		default: DEFAULT_VALUES.CURRENCY,
		required: true,
		description: 'Currency type for the transaction',
	},
	{
		displayName: 'Merchant Order Reference',
		name: 'merchantOrderReference',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_ORDER],
			},
		},
		default: '',
		required: true,
		description:
			'Unique identifier for the order request (1-50 chars, only A-Z, a-z, 0-9, -, _)',
		placeholder: 'order_12345',
	},
	// Optional fields
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [Operation.CREATE_ORDER],
			},
		},
		options: [
			{
				displayName: 'Pre Auth',
				name: 'preAuth',
				type: 'boolean',
				default: false,
				description: 'Enable pre-authorization for the order',
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
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Note to associate with the order',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				default: '',
				description: 'Success callback URL for customer redirection',
			},
			{
				displayName: 'Failure Callback URL',
				name: 'failureCallbackUrl',
				type: 'string',
				default: '',
				description: 'Failure callback URL for customer redirection',
			},
			{
				displayName: 'Purchase Details',
				name: 'purchaseDetails',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						displayName: 'Details',
						name: 'details',
						values: [
							{
								displayName: 'Customer Email',
								name: 'customerEmail',
								type: 'string',
								default: '',
								description: "Customer's email address (max 50 chars)",
							},
							{
								displayName: 'Customer First Name',
								name: 'customerFirstName',
								type: 'string',
								default: '',
								description: "Customer's first name (max 50 chars)",
							},
							{
								displayName: 'Customer Last Name',
								name: 'customerLastName',
								type: 'string',
								default: '',
								description: "Customer's last name (max 50 chars)",
							},
							{
								displayName: 'Customer ID',
								name: 'customerId',
								type: 'string',
								default: '',
								description: 'Unique identifier of the customer in your system (max 19 chars)',
							},
							{
								displayName: 'Customer Mobile Number',
								name: 'customerMobileNumber',
								type: 'string',
								default: '',
								description: "Customer's mobile number (10-20 digits)",
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
						],
					},
				],
			},
		],
	},
];

export async function executeCreateOrder(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const orderAmount = this.getNodeParameter('orderAmount', itemIndex) as number;
	const currency = this.getNodeParameter('currency', itemIndex) as string;
	const merchantOrderReference = this.getNodeParameter(
		'merchantOrderReference',
		itemIndex,
	) as string;

	validateAmount(orderAmount);
	validateMerchantReference(merchantOrderReference);

	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;

	const orderAmountObj: Amount = {
		value: orderAmount,
		currency,
	};

	const requestBody: CreateOrderRequest = {
		order_amount: orderAmountObj,
		merchant_order_reference: merchantOrderReference,
	};

	if (additionalOptions.preAuth !== undefined) {
		requestBody.pre_auth = additionalOptions.preAuth as boolean;
	}
	if (additionalOptions.allowedPaymentMethods) {
		const methods = additionalOptions.allowedPaymentMethods as string[];
		if (methods.length > 0) {
			requestBody.allowed_payment_methods = methods;
		}
	}
	if (additionalOptions.notes) {
		requestBody.notes = additionalOptions.notes as string;
	}
	if (additionalOptions.callbackUrl) {
		requestBody.callback_url = additionalOptions.callbackUrl as string;
	}
	if (additionalOptions.failureCallbackUrl) {
		requestBody.failure_callback_url = additionalOptions.failureCallbackUrl as string;
	}

	if (additionalOptions.purchaseDetails) {
		const purchaseDetailsData = additionalOptions.purchaseDetails as IDataObject;
		if (purchaseDetailsData.details) {
			const details = purchaseDetailsData.details as IDataObject;
			const purchaseDetails: PurchaseDetails = {};

			const customer: Customer = {};
			if (details.customerEmail) customer.email_id = details.customerEmail as string;
			if (details.customerFirstName) customer.first_name = details.customerFirstName as string;
			if (details.customerLastName) customer.last_name = details.customerLastName as string;
			if (details.customerId) customer.customer_id = details.customerId as string;
			if (details.customerMobileNumber) {
				customer.mobile_number = details.customerMobileNumber as string;
			}
			if (details.countryCode) customer.country_code = details.countryCode as string;
			if (Object.keys(customer).length) {
				purchaseDetails.customer = customer;
			}

			const billingAddress: Address = {};
			const billingData = details.billingAddress as IDataObject | undefined;
			if (billingData?.address) {
				const addr = billingData.address as IDataObject;
				if (addr.address1) billingAddress.address1 = addr.address1 as string;
				if (addr.address2) billingAddress.address2 = addr.address2 as string;
				if (addr.address3) billingAddress.address3 = addr.address3 as string;
				if (addr.pincode) billingAddress.pincode = addr.pincode as string;
				if (addr.city) billingAddress.city = addr.city as string;
				if (addr.state) billingAddress.state = addr.state as string;
				if (addr.country) billingAddress.country = addr.country as string;
				if (Object.keys(billingAddress).length) {
					purchaseDetails.billing_address = billingAddress;
				}
			}

			const shippingAddress: Address = {};
			const shippingData = details.shippingAddress as IDataObject | undefined;
			if (shippingData?.address) {
				const addr = shippingData.address as IDataObject;
				if (addr.address1) shippingAddress.address1 = addr.address1 as string;
				if (addr.address2) shippingAddress.address2 = addr.address2 as string;
				if (addr.address3) shippingAddress.address3 = addr.address3 as string;
				if (addr.pincode) shippingAddress.pincode = addr.pincode as string;
				if (addr.city) shippingAddress.city = addr.city as string;
				if (addr.state) shippingAddress.state = addr.state as string;
				if (addr.country) shippingAddress.country = addr.country as string;
				if (Object.keys(shippingAddress).length) {
					purchaseDetails.shipping_address = shippingAddress;
				}
			}

			if (Object.keys(purchaseDetails).length) {
				requestBody.purchase_details = purchaseDetails;
			}
		}
	}

	const response = await pineLabsApiRequest(
		this,
		'POST',
		API_ENDPOINTS.ORDERS,
		requestBody,
		itemIndex,
	);

	const enrichedResponse = {
		...response,
		_amount_formatted: response?.order_amount?.value
			? formatAmountINR(response.order_amount.value)
			: undefined,
		_api_info: {
			endpoint: API_ENDPOINTS.ORDERS,
			documentation: DOCUMENTATION_URLS.CREATE_ORDER,
			timestamp: getCurrentTimestamp(),
		},
	};

	return enrichedResponse as IDataObject;
}
