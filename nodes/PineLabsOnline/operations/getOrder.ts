import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { pineLabsApiRequest, validateOrderId, formatAmountINR, getCurrentTimestamp } from '../utils';
import { API_ENDPOINTS, DOCUMENTATION_URLS } from '../constants';
import { Operation } from '../enums/operations';

export const getOrderDescription: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.GET_ORDER],
			},
		},
		default: '',
		required: true,
		description: 'Unique identifier of the order in the Plural database (max 50 chars)',
		placeholder: 'v1-4405071524-aa-qlAtAf',
	},
];

export async function executeGetOrder(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const orderId = this.getNodeParameter('orderId', itemIndex) as string;

	validateOrderId(this, itemIndex, orderId);

	const response = await pineLabsApiRequest(
		this,
		'GET',
		`${API_ENDPOINTS.GET_ORDER}/${orderId}`,
		undefined,
		itemIndex,
	);

	const enrichedResponse = {
		...response,
		_amount_formatted: response?.order_amount?.value
			? formatAmountINR(response.order_amount.value)
			: undefined,
		_api_info: {
			endpoint: `${API_ENDPOINTS.ORDERS}/${orderId}`,
			documentation: DOCUMENTATION_URLS.GET_ORDER,
			timestamp: getCurrentTimestamp(),
		},
	};

	return enrichedResponse as IDataObject;
}
