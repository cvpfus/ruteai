# Customer Dashboard Spec

## ADDED Requirements

### Requirement: Dashboard Authentication (via Better Auth)
The system SHALL require Better Auth authentication for accessing the customer dashboard.

#### Scenario: Access dashboard
- **WHEN** an unauthenticated user attempts to access the dashboard
- **THEN** the system SHALL redirect them to the sign-in page
- **AND** after successful login via Better Auth, redirect back to the requested page

#### Scenario: Email/password sign-up
- **WHEN** a new user submits the sign-up form
- **THEN** the system SHALL call `authClient.signUp.email()` to create an account
- **AND** create a Better Auth user and session
- **AND** redirect to the dashboard

#### Scenario: Email/password sign-in
- **WHEN** an existing user submits the sign-in form
- **THEN** the system SHALL call `authClient.signIn.email()` to authenticate
- **AND** establish a session via Better Auth
- **AND** redirect to the dashboard

#### Scenario: Sign out
- **WHEN** a user clicks sign out
- **THEN** the system SHALL call `authClient.signOut()` to end the session
- **AND** redirect to the sign-in page

### Requirement: Dashboard Overview
The system SHALL provide an overview of account status on the dashboard.

#### Scenario: View account overview
- **WHEN** an authenticated customer views the dashboard
- **THEN** the system SHALL display:
  - Current credit balance in IDR
  - Total API requests (last 30 days)
  - Total tokens used (last 30 days)
  - Total spend (last 30 days)
  - Quick actions (top-up, create API key)

### Requirement: API Key Management UI
The system SHALL provide a UI for managing API keys.

#### Scenario: View API keys
- **WHEN** a customer navigates to the API keys page
- **THEN** the system SHALL display a table of all API keys with:
  - Key name
  - Key prefix (e.g., rute_abc123...)
  - Creation date
  - Last used
  - Status (active/revoked)
  - Actions (revoke, copy)

#### Scenario: Create API key modal
- **WHEN** a customer clicks "Create New API Key"
- **THEN** the system SHALL show a modal with:
  - Input field for key name
  - Create button
- **AND** upon creation, display the full API key with a copy button
- **AND** warn that the key will not be shown again

### Requirement: Usage Analytics UI
The system SHALL provide visualizations of usage data.

#### Scenario: View usage charts
- **WHEN** a customer navigates to the usage page
- **THEN** the system SHALL display:
  - Line chart of daily requests (last 30 days)
  - Bar chart of token usage by model
  - Pie chart of cost distribution by model
  - Table of recent requests with details

#### Scenario: Filter usage data
- **WHEN** a customer selects a date range
- **THEN** the system SHALL update all charts and tables to reflect the selected period
- **AND** support date ranges up to 90 days

### Requirement: Transaction History UI
The system SHALL provide a detailed transaction history view.

#### Scenario: View transactions
- **WHEN** a customer navigates to the transactions page
- **THEN** the system SHALL display a paginated table with:
  - Transaction date
  - Type (top-up, usage, refund)
  - Amount (IDR)
  - Description
  - Status

#### Scenario: Export transactions
- **WHEN** a customer clicks "Export"
- **THEN** the system SHALL generate a CSV file with all transactions
- **AND** include date, type, amount, and description columns

### Requirement: Top-up UI
The system SHALL provide an interface for purchasing credits.

#### Scenario: Top-up page
- **WHEN** a customer navigates to the top-up page
- **THEN** the system SHALL display:
  - Current balance
  - Preset amounts (Rp 50,000, Rp 100,000, Rp 500,000, Rp 1,000,000)
  - Custom amount input
  - Payment method selection

#### Scenario: Generate checkout
- **WHEN** a customer selects an amount and clicks "Purchase"
- **THEN** the system SHALL generate a Mayar checkout link
- **AND** redirect the customer to the payment page
- **AND** show a "Return to Dashboard" button after payment
