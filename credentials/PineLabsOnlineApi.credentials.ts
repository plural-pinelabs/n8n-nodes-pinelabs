import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class PineLabsOnlineApi implements ICredentialType {
	name = 'pineLabsOnlineApi';

	displayName = 'Pine Labs Online API';

	documentationUrl = 'httpsDocsN8nIoIntegrationsBuiltinCredentialsPinelabs';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'UAT (Testing)', value: 'uat' },
				{ name: 'Production', value: 'production' },
			],
			default: 'uat',
			description: 'Select UAT for testing or Production for live transactions',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'a17ce30e-f88e-4f81-ada1-c3b4909ed232',
			description: 'Your Pine Labs Client ID',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Pine Labs Client Secret',
		},
	];

	// Test credentials by calling the Generate Token API
	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{ $credentials.environment === "production" ? "https://api.pluralpay.in/api" : "https://pluraluat.v2.pinepg.in/api" }}',
			url: '/auth/v1/token',
			method: 'POST',
			body: {
				client_id: '={{ $credentials.clientId }}',
				client_secret: '={{ $credentials.clientSecret }}',
				grant_type: 'client_credentials',
			},
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};
}
