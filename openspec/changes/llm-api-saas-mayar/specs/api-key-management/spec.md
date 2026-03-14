# API Key Management Spec

## ADDED Requirements

### Requirement: API Key Generation
The system SHALL allow authenticated customers to generate API keys with a unique name.

#### Scenario: Generate new API key
- **WHEN** an authenticated customer submits a request to create a new API key with a name
- **THEN** the system SHALL generate a unique API key with prefix `rute_`
- **AND** store a hash of the key in the database
- **AND** return the full plaintext key to the customer exactly once
- **AND** display only the key prefix in future API calls

#### Scenario: API key name validation
- **WHEN** a customer attempts to create an API key with a name longer than 50 characters
- **THEN** the system SHALL reject the request with a 400 error
- **AND** return an error message "API key name must be 50 characters or less"

### Requirement: API Key Revocation
The system SHALL allow customers to revoke API keys, immediately invalidating them.

#### Scenario: Revoke existing API key
- **WHEN** an authenticated customer requests to revoke an API key they own
- **THEN** the system SHALL mark the key as revoked
- **AND** reject all subsequent requests using that key with a 401 error
- **AND** preserve usage history for billing purposes

#### Scenario: Revoke non-existent key
- **WHEN** a customer attempts to revoke an API key that does not exist or they don't own
- **THEN** the system SHALL return a 404 error
- **AND** not expose whether the key exists

### Requirement: API Key Listing
The system SHALL allow customers to view their active and revoked API keys.

#### Scenario: List customer API keys
- **WHEN** an authenticated customer requests their API key list
- **THEN** the system SHALL return all keys owned by the customer
- **AND** include key name, prefix, creation date, last used date, and status
- **AND** exclude the full key value

### Requirement: API Key Authentication
The system SHALL validate API keys on every request to protected endpoints.

#### Scenario: Valid API key
- **WHEN** a request includes a valid, non-revoked API key in the Authorization header
- **THEN** the system SHALL authenticate the request
- **AND** associate the request with the customer who owns the key
- **AND** update the key's last used timestamp

#### Scenario: Invalid API key
- **WHEN** a request includes an invalid or revoked API key
- **THEN** the system SHALL reject the request with a 401 error
- **AND** return an error message "Invalid API key"

#### Scenario: Missing API key
- **WHEN** a request to a protected endpoint does not include an API key
- **THEN** the system SHALL reject the request with a 401 error
- **AND** return an error message "API key required"
