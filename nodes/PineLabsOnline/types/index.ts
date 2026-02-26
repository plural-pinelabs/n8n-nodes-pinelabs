import type { IDataObject } from 'n8n-workflow';

// ===========================
// CREDENTIAL TYPES
// ===========================

export interface PineLabsCredentials {
	clientId: string;
	clientSecret: string;
	environment: 'uat' | 'production';
}

// ===========================
// TOKEN TYPES
// ===========================

export interface TokenResponse {
	access_token: string;
	expires_at: string;
}

// ===========================
// AMOUNT TYPES
// ===========================

export interface Amount {
	value: number; // in Paisa, min 100, max 100000000
	currency: string; // e.g., "INR"
}

// ===========================
// ADDRESS TYPES
// ===========================

export interface Address {
	address1?: string; // max 100 chars
	address2?: string;
	address3?: string;
	pincode?: string; // 6-10 chars, digits only
	city?: string; // max 50 chars
	state?: string;
	country?: string;
}

// ===========================
// CUSTOMER TYPES
// ===========================

export interface Customer {
	email_id?: string; // max 50 chars
	first_name?: string;
	last_name?: string;
	customer_id?: string; // max 19 chars
	mobile_number?: string; // 10-20 chars, digits only
	country_code?: string; // e.g., "91"
	billing_address?: Address;
	shipping_address?: Address;
	merchant_customer_reference?: string;
	gstin?: string;
}

// ===========================
// PRODUCT TYPES
// ===========================

export interface ProductDetail {
	product_code?: string;
	product_amount?: Amount;
	product_coupon_discount_amount?: Amount;
}

// ===========================
// PURCHASE DETAILS TYPES
// ===========================

export interface PurchaseDetails {
	customer?: Customer;
	billing_address?: Address;
	shipping_address?: Address;
}

// ===========================
// CREATE PAYMENT LINK REQUEST
// ===========================

export interface CreatePaymentLinkRequest {
	amount: Amount;
	description?: string;
	expire_by?: string;
	allowed_payment_methods?: string;
	merchant_payment_link_reference: string;
	customer: Customer;
	product_details?: ProductDetail[];
	cart_coupon_discount_amount?: Amount;
	merchant_metadata?: Record<string, string>;
}

// ===========================
// CREATE ORDER REQUEST
// ===========================

export interface CreateOrderRequest {
	merchant_order_reference: string;
	order_amount: Amount;
	pre_auth?: boolean;
	allowed_payment_methods?: string[];
	notes?: string;
	callback_url?: string;
	failure_callback_url?: string;
	purchase_details?: PurchaseDetails;
}

// ===========================
// PAYMENT LINK RESPONSE
// ===========================

export interface PaymentLinkResponse extends IDataObject {
	payment_link: string;
	payment_link_id: string;
	status: string;
	amount: Amount;
	amount_due: Amount;
	order_id: string;
	merchant_payment_link_reference: string;
	description?: string;
	expire_by?: string;
	allowed_payment_methods?: string[];
	customer: Customer;
	product_details?: ProductDetail[];
	cart_coupon_discount_amount?: Amount;
	merchant_metadata?: Record<string, string>;
	created_at: string;
	updated_at: string;
}

// ===========================
// ERROR TYPES
// ===========================

export interface PineLabsApiError {
	code: string;
	message: string;
	additionalErrorPayload?: {
		source?: string;
		step?: string;
	};
}

// ===========================
// METADATA KEY-VALUE
// ===========================

export interface MetadataItem {
	key: string;
	value: string;
}
