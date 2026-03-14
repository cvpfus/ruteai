# Rate Limiting Spec

## ADDED Requirements

### Requirement: Tiered Rate Limits
The system SHALL enforce rate limits based on customer subscription tier.

#### Scenario: Free tier limits
- **WHEN** a customer on the Free tier makes API requests
- **THEN** the system SHALL enforce:
  - 10 requests per minute (RPM)
  - 100 requests per day
  - 10,000 tokens per day

#### Scenario: Basic tier limits
- **WHEN** a customer on the Basic tier makes API requests
- **THEN** the system SHALL enforce:
  - 60 requests per minute (RPM)
  - 10,000 requests per day
  - 1,000,000 tokens per day

#### Scenario: Pro tier limits
- **WHEN** a customer on the Pro tier makes API requests
- **THEN** the system SHALL enforce:
  - 600 requests per minute (RPM)
  - 100,000 requests per day
  - 10,000,000 tokens per day

#### Scenario: Enterprise tier limits
- **WHEN** a customer on the Enterprise tier makes API requests
- **THEN** the system SHALL apply custom limits configured for that customer

### Requirement: Rate Limit Enforcement
The system SHALL reject requests that exceed rate limits.

#### Scenario: Exceed RPM limit
- **WHEN** a customer exceeds their requests per minute limit
- **THEN** the system SHALL reject the request with a 429 status code
- **AND** include a Retry-After header indicating when to retry
- **AND** return an error message "Rate limit exceeded. Please retry after {seconds} seconds."

#### Scenario: Exceed daily request limit
- **WHEN** a customer exceeds their daily request limit
- **THEN** the system SHALL reject the request with a 429 status code
- **AND** return an error message "Daily request limit exceeded. Resets at midnight UTC."

#### Scenario: Exceed token limit
- **WHEN** a customer exceeds their daily token limit
- **THEN** the system SHALL reject the request with a 429 status code
- **AND** return an error message "Daily token limit exceeded. Resets at midnight UTC."

### Requirement: Rate Limit Headers
The system SHALL include rate limit information in API responses.

#### Scenario: Include rate limit headers
- **WHEN** an API request is processed successfully
- **THEN** the system SHALL include the following headers:
  - X-RateLimit-Limit: maximum requests allowed
  - X-RateLimit-Remaining: remaining requests in current window
  - X-RateLimit-Reset: Unix timestamp when the limit resets

### Requirement: Sliding Window Rate Limiting
The system SHALL use a sliding window algorithm for rate limiting.

#### Scenario: Sliding window calculation
- **WHEN** calculating rate limit usage
- **THEN** the system SHALL count requests in a sliding time window
- **AND** not use fixed time buckets
- **AND** provide smooth rate limiting without burst issues at window boundaries

### Requirement: Rate Limit Bypass for Internal
The system SHALL allow internal/admin requests to bypass rate limits.

#### Scenario: Admin bypass
- **WHEN** a request is made with an admin API key
- **THEN** the system SHALL skip rate limit checks
- **AND** process the request normally

#### Scenario: Internal service bypass
- **WHEN** a request originates from internal services
- **THEN** the system SHALL skip rate limit checks
- **AND** log the bypass for audit purposes
