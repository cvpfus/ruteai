# Webhook Handler Spec

## ADDED Requirements

### Requirement: Mayar Webhook Endpoint
The system SHALL expose an HTTP endpoint to receive Mayar webhooks.

#### Scenario: Receive webhook
- **WHEN** Mayar sends a webhook to the configured endpoint
- **THEN** the system SHALL accept POST requests at /api/webhooks/mayar
- **AND** parse the webhook payload
- **AND** return 200 OK for successful processing

#### Scenario: Webhook method validation
- **WHEN** a request is made to the webhook endpoint with a method other than POST
- **THEN** the system SHALL return a 405 Method Not Allowed error

### Requirement: Webhook Signature Verification
The system SHALL verify webhook signatures to ensure authenticity.

#### Scenario: Valid signature
- **WHEN** a webhook is received with a valid signature header
- **THEN** the system SHALL verify the signature using the Mayar webhook secret
- **AND** process the webhook if verification succeeds

#### Scenario: Invalid signature
- **WHEN** a webhook is received with an invalid signature
- **THEN** the system SHALL reject the request with a 401 error
- **AND** log the failed verification attempt
- **AND** not process the webhook payload

#### Scenario: Missing signature
- **WHEN** a webhook is received without a signature header
- **THEN** the system SHALL reject the request with a 401 error
- **AND** return an error message "Missing webhook signature"

### Requirement: Payment Success Handling
The system SHALL process successful payment webhooks from Mayar.

#### Scenario: Process credit top-up
- **WHEN** a webhook is received for a successful credit purchase
- **THEN** the system SHALL:
  - Verify the transaction ID is unique
  - Identify the customer from the webhook data
  - Add the purchased credits to the customer's balance
  - Create a transaction record
  - Send a confirmation email to the customer

#### Scenario: Handle duplicate transaction
- **WHEN** a webhook is received with a transaction ID that already exists
- **THEN** the system SHALL return 200 OK
- **AND** not add duplicate credits
- **AND** log the duplicate webhook for audit purposes

### Requirement: Webhook Error Handling
The system SHALL handle webhook processing errors gracefully.

#### Scenario: Processing error
- **WHEN** an error occurs during webhook processing
- **THEN** the system SHALL return a 500 error
- **AND** log the error details
- **AND** allow Mayar to retry the webhook

#### Scenario: Customer not found
- **WHEN** a webhook references a customer that does not exist
- **THEN** the system SHALL return a 400 error
- **AND** log the error with the customer reference
- **AND** alert the admin for manual review

### Requirement: Webhook Logging
The system SHALL log all webhook requests for audit and debugging.

#### Scenario: Log webhook receipt
- **WHEN** any webhook is received
- **THEN** the system SHALL log:
  - Timestamp
  - Webhook type
  - Transaction ID
  - Customer reference
  - Processing status (success/failure)
  - Error message (if any)

#### Scenario: Webhook retention
- **WHEN** webhook logs are created
- **THEN** the system SHALL retain logs for 90 days
- **AND** allow admin access for troubleshooting
