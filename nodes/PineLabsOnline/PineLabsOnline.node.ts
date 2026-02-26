import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { NODE_CONFIG } from './constants';
import { Resource, Operation, PAYMENT_LINK_OPERATIONS, ORDER_OPERATIONS } from './enums';
import {
	createPaymentLinkDescription,
	executeCreatePaymentLink,
	createOrderDescription,
	executeCreateOrder,
	getPaymentLinkDescription,
	executeGetPaymentLink,
	getOrderDescription,
	executeGetOrder,
} from './operations';

export class PineLabsOnline implements INodeType {
	description: INodeTypeDescription = {
		displayName: NODE_CONFIG.DISPLAY_NAME,
		name: NODE_CONFIG.NAME,
		icon: NODE_CONFIG.ICON,
		group: ['transform'],
		version: NODE_CONFIG.VERSION,
		subtitle: NODE_CONFIG.SUBTITLE,
		description: NODE_CONFIG.DESCRIPTION,
		defaults: {
			name: NODE_CONFIG.DISPLAY_NAME,
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: NODE_CONFIG.CREDENTIAL_NAME,
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Payment Link',
						value: Resource.PAYMENT_LINK,
					},
					{
						name: 'Order',
						value: Resource.ORDER,
					},
				],
				default: Resource.PAYMENT_LINK,
			},
			// Operation selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.PAYMENT_LINK],
					},
				},
				options: PAYMENT_LINK_OPERATIONS,
				default: Operation.CREATE_PAYMENT_LINK,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.ORDER],
					},
				},
				options: ORDER_OPERATIONS,
				default: Operation.CREATE_ORDER,
			},
			// Create Payment Link fields
			...createPaymentLinkDescription,
			// Create Order fields
			...createOrderDescription,
			// Get Order fields
			...getOrderDescription,
			// Get Payment Link fields
			...getPaymentLinkDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as Operation;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				let responseData;

				if (operation === Operation.CREATE_PAYMENT_LINK) {
					responseData = await executeCreatePaymentLink.call(this, itemIndex);
				} else if (operation === Operation.CREATE_ORDER) {
					responseData = await executeCreateOrder.call(this, itemIndex);
				} else if (operation === Operation.GET_ORDER) {
					responseData = await executeGetOrder.call(this, itemIndex);
				} else if (operation === Operation.GET_PAYMENT_LINK) {
					responseData = await executeGetPaymentLink.call(this, itemIndex);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported`,
						{ itemIndex },
					);
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							itemIndex,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
