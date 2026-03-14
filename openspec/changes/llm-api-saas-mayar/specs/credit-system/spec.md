# Credit System Spec

## ADDED Requirements

### Requirement: Credit Balance Management
The system SHALL maintain a credit balance for each customer in Indonesian Rupiah (IDR).

#### Scenario: View credit balance
- **WHEN** an authenticated customer views their dashboard
- **THEN** the system SHALL display their current credit balance in IDR
- **AND** show the balance in real-time with reactive updates

#### Scenario: Credit balance precision
- **WHEN** the system stores or displays credit amounts
- **THEN** the system SHALL use integer values representing Rupiah
- **AND** not use decimal/floating point for currency

### Requirement: Credit Top-up via Mayar
The system SHALL integrate with Mayar to allow customers to purchase credits.

#### Scenario: Generate checkout link
- **WHEN** a customer requests to purchase credits with a valid amount (minimum Rp 50,000)
- **THEN** the system SHALL call Mayar API to generate an immutable checkout link
- **AND** return the checkout URL to the customer
- **AND** create a pending transaction record

#### Scenario: Invalid top-up amount
- **WHEN** a customer attempts to purchase credits below the minimum amount (Rp 50,000)
- **THEN** the system SHALL reject the request with a 400 error
- **AND** return an error message "Minimum top-up amount is Rp 50,000"

#### Scenario: Process successful payment webhook
- **WHEN** the system receives a valid Mayar webhook for a completed payment
- **THEN** the system SHALL verify the webhook signature
- **AND** add the purchased credits to the customer's balance
- **AND** mark the transaction as completed
- **AND** send a confirmation notification to the customer

#### Scenario: Handle duplicate webhook
- **WHEN** the system receives a webhook with a transaction ID that was already processed
- **THEN** the system SHALL acknowledge the webhook with 200 OK
- **AND** not add duplicate credits to the balance

### Requirement: Credit Spending
The system SHALL deduct credits from customer balance when they use LLM API.

#### Scenario: Deduct credits for API request
- **WHEN** a customer makes an LLM API request
- **THEN** the system SHALL calculate the estimated cost based on max_tokens
- **AND** check if the customer has sufficient balance
- **AND** deduct the estimated amount from their balance before processing

#### Scenario: Insufficient credits
- **WHEN** a customer makes an API request with insufficient balance
- **THEN** the system SHALL reject the request with a 402 error
- **AND** return an error message "Insufficient credits. Please top up your balance."
- **AND** include a link to the top-up page

#### Scenario: Refund unused credits
- **WHEN** an LLM request completes with actual token usage less than max_tokens
- **THEN** the system SHALL calculate the difference between estimated and actual cost
- **AND** refund the unused amount to the customer's balance
- **AND** record the refund transaction

### Requirement: Credit Transaction History
The system SHALL maintain a complete history of all credit transactions.

#### Scenario: View transaction history
- **WHEN** an authenticated customer views their transaction history
- **THEN** the system SHALL return a paginated list of all transactions
- **AND** include transaction type (top-up, usage, refund), amount, timestamp, and description
- **AND** sort by timestamp descending (newest first)

#### Scenario: Transaction history pagination
- **WHEN** a customer requests transaction history
- **THEN** the system SHALL return 20 transactions per page by default
- **AND** support page parameter for navigation
