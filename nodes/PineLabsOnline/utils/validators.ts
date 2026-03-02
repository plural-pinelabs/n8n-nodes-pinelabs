import { NodeOperationError } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '../constants';

export function validateAmount(context: IExecuteFunctions, itemIndex: number, amount: number): void {
	if (amount < VALIDATION_LIMITS.MIN_AMOUNT) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.MIN_AMOUNT, { itemIndex });
	}
	if (amount > VALIDATION_LIMITS.MAX_AMOUNT) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.MAX_AMOUNT, { itemIndex });
	}
}

export function validateMerchantReference(context: IExecuteFunctions, itemIndex: number, ref: string): void {
	if (
		!ref ||
		ref.length < VALIDATION_LIMITS.MIN_MERCHANT_REF_LENGTH ||
		ref.length > VALIDATION_LIMITS.MAX_MERCHANT_REF_LENGTH
	) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.INVALID_MERCHANT_REF, { itemIndex });
	}
	if (!/^[A-Za-z0-9\-_]+$/.test(ref)) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.INVALID_MERCHANT_REF, { itemIndex });
	}
}

export function validatePaymentLinkId(context: IExecuteFunctions, itemIndex: number, id: string): void {
	if (!id || id.length > VALIDATION_LIMITS.MAX_PAYMENT_LINK_ID_LENGTH) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.INVALID_PAYMENT_LINK_ID, { itemIndex });
	}
}

export function validateOrderId(context: IExecuteFunctions, itemIndex: number, id: string): void {
	if (!id || id.length > VALIDATION_LIMITS.MAX_ORDER_ID_LENGTH) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.INVALID_ORDER_ID, { itemIndex });
	}
}

export function validateExpireBy(context: IExecuteFunctions, itemIndex: number, expireBy: string): void {
	if (!expireBy) return;
	const expireDate = new Date(expireBy);
	if (isNaN(expireDate.getTime())) {
		throw new NodeOperationError(context.getNode(), 'expire_by must be a valid ISO 8601 timestamp', { itemIndex });
	}
	const maxDate = new Date();
	maxDate.setDate(maxDate.getDate() + VALIDATION_LIMITS.MAX_EXPIRE_DAYS);
	if (expireDate > maxDate) {
		throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.INVALID_EXPIRE_BY, { itemIndex });
	}
}
