# API Key Management Spec

## ADDED Requirements

### Requirement: API Key Generation (via Better Auth API Key Plugin)
The system SHALL allow authenticated customers to generate API keys using the `@better-auth/api-key` plugin.

#### Scenario: Generate new API key
- **WHEN** an authenticated customer submits a request to create a new API key with a name
- **THEN** the system SHALL call `auth.api.createApiKey()` with prefix `rute_`
- **AND** the plugin stores a hash of the key in the database automatically
- **AND** return the full plaintext key to the customer exactly once (via the `key` field in the response)
- **AND** display only the key prefix in future API calls

#### Scenario: API key name validation
- **WHEN** a customer attempts to create an API key with a name longer than 50 characters
- **THEN** the system SHALL reject the request with a 400 error
- **AND** return an error message "API key name must be 50 characters or less"

#### Scenario: API key with tier-based rate limits
- **WHEN** a customer creates a new API key
- **THEN** the system SHALL configure the key's rate limits based on the customer's tier via `rateLimitMax`, `rateLimitTimeWindow`, and `rateLimitEnabled` parameters

### Requirement: API Key Revocation
The system SHALL allow customers to revoke API keys via `authClient.apiKey.delete()`, immediately invalidating them.

#### Scenario: Revoke existing API key
- **WHEN** an authenticated customer requests to revoke an API key they own
- **THEN** the system SHALL call `auth.api.deleteApiKey()` to remove the key
- **AND** reject all subsequent requests using that key with a 401 error
- **AND** preserve usage history for billing purposes

#### Scenario: Revoke non-existent key
- **WHEN** a customer attempts to revoke an API key that does not exist or they don't own
- **THEN** the system SHALL return a 404 error
- **AND** not expose whether the key exists

### Requirement: API Key Listing
The system SHALL allow customers to view their API keys via `authClient.apiKey.list()`.

#### Scenario: List customer API keys
- **WHEN** an authenticated customer requests their API key list
- **THEN** the system SHALL call `auth.api.listApiKeys()` and return all keys owned by the customer
- **AND** include key name, prefix, creation date, last used date, and status
- **AND** exclude the full key value
- **AND** support pagination via `limit` and `offset` parameters

### Requirement: API Key Authentication
The system SHALL validate API keys on every request to protected endpoints using `auth.api.verifyApiKey()`.

#### Scenario: Valid API key
- **WHEN** a request includes a valid, non-expired API key in the Authorization header (`Bearer rute_...`)
- **THEN** the system SHALL call `auth.api.verifyApiKey({ body: { key } })` to authenticate
- **AND** associate the request with the user who owns the key
- **AND** the plugin automatically checks built-in rate limits

#### Scenario: Invalid API key
- **WHEN** a request includes an invalid, expired, or deleted API key
- **THEN** the system SHALL reject the request with a 401 error
- **AND** return an error message "Invalid API key"

#### Scenario: Missing API key
- **WHEN** a request to a protected endpoint does not include an API key
- **THEN** the system SHALL reject the request with a 401 error
- **AND** return an error message "API key required"
