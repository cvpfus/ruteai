# Usage Tracking Spec

## ADDED Requirements

### Requirement: Token Usage Tracking
The system SHALL track token usage for every LLM API request.

#### Scenario: Track prompt tokens
- **WHEN** an LLM request is processed
- **THEN** the system SHALL count the number of tokens in the prompt
- **AND** store the prompt token count with the request record

#### Scenario: Track completion tokens
- **WHEN** an LLM response is received
- **THEN** the system SHALL count the number of tokens in the completion
- **AND** store the completion token count with the request record

#### Scenario: Calculate total cost
- **WHEN** a request completes
- **THEN** the system SHALL calculate the total cost based on:
  - Prompt tokens × prompt price per 1K tokens
  - Completion tokens × completion price per 1K tokens
- **AND** store the cost in IDR

### Requirement: Request Logging
The system SHALL log all API requests for analytics and debugging.

#### Scenario: Log successful request
- **WHEN** an LLM request completes successfully
- **THEN** the system SHALL create a request log with:
  - API key ID (not the key itself)
  - Customer ID
  - Model used
  - Prompt tokens
  - Completion tokens
  - Total cost
  - Timestamp
  - Response time (latency)
  - Status (success)

#### Scenario: Log failed request
- **WHEN** an LLM request fails
- **THEN** the system SHALL create a request log with:
  - API key ID
  - Customer ID
  - Model requested
  - Error type
  - Timestamp
  - Status (failed)
  - Error message (sanitized)

### Requirement: Usage Analytics
The system SHALL provide usage analytics for customers.

#### Scenario: Daily usage summary
- **WHEN** a customer views their usage dashboard
- **THEN** the system SHALL display a daily breakdown of:
  - Total requests
  - Total tokens used (prompt + completion)
  - Total cost in IDR
  - Most used models

#### Scenario: Monthly usage report
- **WHEN** a customer views their monthly usage
- **THEN** the system SHALL aggregate usage by month
- **AND** show total spend, average cost per request, and usage trends

### Requirement: Cost Calculation
The system SHALL calculate costs based on per-model pricing.

#### Scenario: Define model pricing
- **WHEN** an admin configures model pricing
- **THEN** the system SHALL store:
  - Model ID
  - Prompt price per 1K tokens (in IDR)
  - Completion price per 1K tokens (in IDR)
  - Context window size
  - Last updated timestamp

#### Scenario: Apply pricing markup
- **WHEN** calculating customer cost
- **THEN** the system SHALL apply the configured markup percentage
- **AND** round up to the nearest Rupiah
