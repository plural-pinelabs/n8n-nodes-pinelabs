import { ApplicationError } from 'n8n-workflow';
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '../constants';

export function validateAmount(amount: number): void {
	if (amount < VALIDATION_LIMITS.MIN_AMOUNT) {
		throw new ApplicationError(ERROR_MESSAGES.MIN_AMOUNT);
	}
	if (amount > VALIDATION_LIMITS.MAX_AMOUNT) {
		throw new ApplicationError(ERROR_MESSAGES.MAX_AMOUNT);
	}
}

export function validateMerchantReference(ref: string): void {
	if (
		!ref ||
		ref.length < VALIDATION_LIMITS.MIN_MERCHANT_REF_LENGTH ||
		ref.length > VALIDATION_LIMITS.MAX_MERCHANT_REF_LENGTH
	) {
		throw new ApplicationError(ERROR_MESSAGES.INVALID_MERCHANT_REF);
	}
	if (!/^[A-Za-z0-9\-_]+$/.test(ref)) {
		throw new ApplicationError(ERROR_MESSAGES.INVALID_MERCHANT_REF);
	}
}

export function validatePaymentLinkId(id: string): void {
	if (!id || id.length > VALIDATION_LIMITS.MAX_PAYMENT_LINK_ID_LENGTH) {
		throw new ApplicationError(ERROR_MESSAGES.INVALID_PAYMENT_LINK_ID);
	}
}

export function validateOrderId(id: string): void {
	if (!id || id.length > VALIDATION_LIMITS.MAX_ORDER_ID_LENGTH) {
		throw new ApplicationError(ERROR_MESSAGES.INVALID_ORDER_ID);
	}
}

export function validateExpireBy(expireBy: string): void {
	if (!expireBy) return;
	const expireDate = new Date(expireBy);
	if (isNaN(expireDate.getTime())) {
		throw new ApplicationError('expire_by must be a valid ISO 8601 timestamp');
	}
	const maxDate = new Date();
	maxDate.setDate(maxDate.getDate() + VALIDATION_LIMITS.MAX_EXPIRE_DAYS);
	if (expireDate > maxDate) {
		throw new ApplicationError(ERROR_MESSAGES.INVALID_EXPIRE_BY);
	}
}
