# n8n-nodes-pinelabs

[![npm version](https://img.shields.io/npm/v/n8n-nodes-pinelabs.svg)](https://www.npmjs.com/package/n8n-nodes-pinelabs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an n8n community node package that enables integration with Pine Labs Online Pay by Link APIs. It allows you to create and manage payment links directly within your n8n workflows.

## Features

- **Create Payment Link**: Generate unique payment links that can be shared with customers via email, SMS, or messaging apps
- **Get Payment Link**: Fetch payment link details by Payment Link ID
- **Auto-authentication**: Automatically handles Bearer token generation using your Client ID and Secret
- **Environment Support**: Switch between UAT (testing) and Production environments
- **Comprehensive Validation**: Built-in validation for amounts, references, and expiry dates
- **Rich Response Data**: Enriched responses with formatted amounts and API metadata

## Installation

### Community Node Installation (Recommended)

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Click **Install a Community Node**
3. Enter `n8n-nodes-pinelabs`
4. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-pinelabs
```

Restart your n8n instance after installation.

## Prerequisites

You need Pine Labs Online API credentials:
- **Client ID**
- **Client Secret**
- Access to either UAT or Production environment

Contact Pine Labs to obtain your credentials.

## Configuration

### 1. Add Credentials

1. In n8n, go to **Credentials** > **New**
2. Search for "Pine Labs Online API"
3. Fill in:
   - **Environment**: Choose "UAT (Testing)" or "Production"
   - **Client ID**: Your Pine Labs Client ID
   - **Client Secret**: Your Pine Labs Client Secret
4. Click **Test** to verify your credentials
5. Click **Save**

### 2. Use in Workflows

1. Add a new node to your workflow
2. Search for "Pine Labs Online"
3. Select the node
4. Choose your credential
5. Select an operation:
   - **Create Payment Link**: Create a new payment link
   - **Get Payment Link**: Retrieve an existing payment link

## Operations

### Create Payment Link

Creates a payment link and sends it to the customer.

**Required Fields:**
- Amount (in Paisa, 100 paisa = Rs 1)
- Currency (e.g., "INR")
- Merchant Payment Link Reference (unique identifier, 1-50 chars)
- Customer Email
- Customer First Name
- Customer Last Name
- Customer Mobile Number

**Optional Fields (in Additional Options):**
- Description
- Expire By (max 180 days from now)
- Allowed Payment Methods (Card, UPI, Net Banking, Wallet, etc.)
- Country Code
- Customer ID
- GSTIN
- Billing Address
- Shipping Address
- Product Details
- Cart Coupon Discount
- Merchant Metadata

**Response:**
Returns the complete payment link object including:
- `payment_link`: The generated URL
- `payment_link_id`: Unique identifier
- `status`: Current status (e.g., "CREATED")
- `_amount_formatted`: Human-readable amount (e.g., "Rs 1,000.00")
- `_api_info`: API endpoint and documentation links

### Get Payment Link

Fetches a payment link by its Payment Link ID.

**Required Fields:**
- Payment Link ID (max 50 chars)

**Response:**
Returns the complete payment link object with current status and details.

## Example Workflows

### Simple Payment Link Creation

```
1. Manual Trigger
2. Pine Labs Online (Create Payment Link)
   - Amount: 100000 (Rs 1,000)
   - Currency: INR
   - Merchant Reference: order_123
   - Customer Email: customer@example.com
   - Customer First Name: John
   - Customer Last Name: Doe
   - Customer Mobile: 9876543210
3. Send Email (with payment link)
```

### Check Payment Status

```
1. Schedule Trigger (every 5 minutes)
2. Pine Labs Online (Get Payment Link)
   - Payment Link ID: {{ $json.payment_link_id }}
3. IF Node (check status)
   - If status = "PROCESSED": Send confirmation
   - Else: Continue waiting
```

## Validation

The node includes built-in validation:
- **Amount**: Must be between 100 (Rs 1) and 100000000 (Rs 10 lakh) in paisa
- **Merchant Reference**: 1-50 characters, only A-Z, a-z, 0-9, -, _
- **Payment Link ID**: Required and max 50 characters
- **Expire By**: Must be within 180 days from now

## Error Handling

Errors are returned with descriptive messages:
- Authentication errors include hints to check credentials
- API errors include error codes and messages from Pine Labs
- Use the "Continue on Fail" option to handle errors gracefully in workflows

## API Documentation

For detailed API documentation, visit:
- [Pine Labs Developer Portal](https://developer.pinelabsonline.com/)
- [Create Payment Link API](https://developer.pinelabsonline.com/reference/payment-link-create)
- [Get Payment Link API](https://developer.pinelabsonline.com/reference/payment-link-get-by-payment-link-id)

## Support

- **Documentation**: [Pine Labs API Docs](https://developer.pinelabsonline.com/)

## Development

### Build

```bash
npm install
npm run build
```

### Lint

```bash
npm run lint
npm run lintfix
```

### Test Locally

```bash
# Link the package
npm link

# Link to n8n
cd ~/.n8n
npm link n8n-nodes-pinelabs

# Start n8n
n8n start
```

## License

MIT



