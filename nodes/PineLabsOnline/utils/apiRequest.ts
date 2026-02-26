import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { PineLabsCredentials, TokenResponse } from '../types';
import { API_BASE_URLS, API_ENDPOINTS, ERROR_MESSAGES } from '../constants';

function tryParseJson(str: string): any {
	try {
		return JSON.parse(str);
	} catch {
		return str;
	}
}

function getBaseUrl(environment: string): string {
	return environment === 'production' ? API_BASE_URLS.PRODUCTION : API_BASE_URLS.UAT;
}

function generateRequestId(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function getRequestTimestamp(): string {
	return new Date().toISOString();
}

/**
 * Obtain a Bearer token from Pine Labs Generate Token API.
 * Called automatically before every API request.
 */
async function generateToken(
	context: IExecuteFunctions,
	credentials: PineLabsCredentials,
): Promise<string> {
	const baseUrl = getBaseUrl(credentials.environment);
	const tokenOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}${API_ENDPOINTS.GENERATE_TOKEN}`,
		body: {
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
			grant_type: 'client_credentials',
		},
		headers: {
			'Content-Type': 'application/json',
			'Request-Timestamp': getRequestTimestamp(),
			'Request-ID': generateRequestId(),
		},
		json: true,
	};

	try {
		const response: TokenResponse = await context.helpers.httpRequest(tokenOptions);
		if (!response.access_token) {
			throw new Error('No access_token in token response');
		}
		return response.access_token;
	} catch (error: unknown) {
		throw new NodeOperationError(
			context.getNode(),
			`${ERROR_MESSAGES.TOKEN_GENERATION_FAILED}: ${(error as Error).message}`,
		);
	}
}

/**
 * Make an authenticated API request to Pine Labs.
 * Automatically generates a Bearer token before each request.
 */
export async function pineLabsApiRequest(
	context: IExecuteFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	path: string,
	body?: object,
	itemIndex: number = 0,
): Promise<any> {
	const credentials = (await context.getCredentials(
		'pineLabsOnlineApi',
	)) as unknown as PineLabsCredentials;

	const baseUrl = getBaseUrl(credentials.environment);
	const accessToken = await generateToken(context, credentials);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${path}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
			'Request-Timestamp': getRequestTimestamp(),
			'Request-ID': generateRequestId(),
		},
		json: true,
	};

	if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
		options.body = body;
	}

	try {
		return await context.helpers.httpRequest(options);
	} catch (error: unknown) {
		const err = error as any;

		// n8n's httpRequest wraps Axios errors in various ways depending on version.
		// Try multiple paths to extract the actual API response body.
		const apiError =
			err.cause?.response?.data ||
			err.cause?.response?.body ||
			err.response?.data ||
			err.response?.body ||
			err.body ||
			(typeof err.description === 'string' ? tryParseJson(err.description) : err.description) ||
			(typeof err.cause === 'object' && err.cause !== null && !('response' in err.cause)
				? err.cause
				: undefined);

		const errorCode = apiError?.code || apiError?.error_code || err.httpCode || '';
		const errorMessage =
			apiError?.message ||
			apiError?.error_message ||
			(typeof apiError === 'string' ? apiError : '') ||
			err.message ||
			'Unknown API error';
		const additionalInfo = apiError?.additionalErrorPayload
			? ` [Source: ${apiError.additionalErrorPayload.source}, Step: ${apiError.additionalErrorPayload.step}]`
			: '';

		// If we still have no useful detail, include stringified apiError for debugging
		const debugDetail =
			!errorCode && errorMessage === err.message && apiError
				? ` | Response: ${JSON.stringify(apiError).slice(0, 500)}`
				: '';

		throw new NodeOperationError(
			context.getNode(),
			`Pine Labs API Error (${errorCode}): ${errorMessage}${additionalInfo}${debugDetail}`,
			{ itemIndex },
		);
	}
}
