import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { pineLabsApiRequest, validatePaymentLinkId, formatAmountINR, getCurrentTimestamp } from '../utils';
import { API_ENDPOINTS, DOCUMENTATION_URLS } from '../constants';
import { Operation } from '../enums/operations';

export const getPaymentLinkDescription: INodeProperties[] = [
	{
		displayName: 'Payment Link ID',
		name: 'paymentLinkId',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.GET_PAYMENT_LINK],
			},
		},
		default: '',
		required: true,
		description: 'Unique identifier of the payment link in the Plural database (max 50 chars)',
		placeholder: 'pl-v1-250306082755-aa-uT0noy',
	},
];

export async function executeGetPaymentLink(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	// Read payment link ID
	const paymentLinkId = this.getNodeParameter('paymentLinkId', itemIndex) as string;

	// Validate payment link ID
	validatePaymentLinkId(this, itemIndex, paymentLinkId);

	// Make API request
	const response = await pineLabsApiRequest(
		this,
		'GET',
		`${API_ENDPOINTS.PAYMENT_LINK}/${paymentLinkId}`,
		undefined,
		itemIndex,
	);

	// Enrich response
	const enrichedResponse = {
		...response,
		_amount_formatted: response?.amount?.value
			? formatAmountINR(response.amount.value)
			: undefined,
		_api_info: {
			endpoint: `${API_ENDPOINTS.PAYMENT_LINK}/${paymentLinkId}`,
			documentation: DOCUMENTATION_URLS.GET_PAYMENT_LINK,
			timestamp: getCurrentTimestamp(),
		},
	};

	return enrichedResponse as IDataObject;
}
