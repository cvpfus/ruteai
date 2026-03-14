# Model Routing Spec

## ADDED Requirements

### Requirement: Model Configuration
The system SHALL maintain a configuration of supported LLM models.

#### Scenario: Define model configuration
- **WHEN** an admin configures a new model
- **THEN** the system SHALL store:
  - Model ID (unique identifier)
  - Display name
  - Provider (openai, anthropic, google)
  - Provider model ID (actual ID used in provider API)
  - Context window size
  - Pricing (prompt and completion per 1K tokens)
  - Capabilities (streaming, function calling, vision)
  - Status (active, deprecated, disabled)

#### Scenario: Model activation
- **WHEN** a model is marked as active
- **THEN** the system SHALL include it in the /v1/models list
- **AND** allow requests to be routed to it

#### Scenario: Model deprecation
- **WHEN** a model is marked as deprecated
- **THEN** the system SHALL include it in the models list with deprecation flag
- **AND** log warnings when the model is used
- **AND** include deprecation notice in responses

### Requirement: Provider Routing
The system SHALL route requests to the correct provider based on model ID.

#### Scenario: Route to OpenAI
- **WHEN** a request specifies a model with provider="openai"
- **THEN** the system SHALL route to OpenAI API
- **AND** use the provider model ID from configuration
- **AND** apply OpenAI-specific request formatting

#### Scenario: Route to Anthropic
- **WHEN** a request specifies a model with provider="anthropic"
- **THEN** the system SHALL route to Anthropic API
- **AND** transform the request from OpenAI format to Anthropic format
- **AND** transform the response back to OpenAI format

#### Scenario: Route to Google
- **WHEN** a request specifies a model with provider="google"
- **THEN** the system SHALL route to Google Gemini API
- **AND** transform the request from OpenAI format to Gemini format
- **AND** transform the response back to OpenAI format

### Requirement: Fallback Routing
The system SHALL support fallback to alternative models when primary is unavailable.

#### Scenario: Provider timeout fallback
- **WHEN** the primary provider times out
- **THEN** the system SHALL attempt to route to a configured fallback model
- **AND** log the fallback event
- **AND** include a header X-Model-Fallback: true in the response

#### Scenario: No fallback available
- **WHEN** the primary provider fails and no fallback is configured
- **THEN** the system SHALL return a 503 error
- **AND** return an error message "Model temporarily unavailable. Please try again later."

### Requirement: Model Aliases
The system SHALL support model aliases for backward compatibility.

#### Scenario: Alias resolution
- **WHEN** a request uses a model alias (e.g., "gpt-4" → "gpt-4-turbo")
- **THEN** the system SHALL resolve the alias to the actual model ID
- **AND** route to the resolved model
- **AND** include X-Resolved-Model header in the response

### Requirement: Model Capabilities
The system SHALL validate requests against model capabilities.

#### Scenario: Validate streaming support
- **WHEN** a request includes `stream: true` for a model that doesn't support streaming
- **THEN** the system SHALL return a 400 error
- **AND** return an error message "Model {model_id} does not support streaming"

#### Scenario: Validate vision support
- **WHEN** a request includes image content for a model without vision capability
- **THEN** the system SHALL return a 400 error
- **AND** return an error message "Model {model_id} does not support vision"

#### Scenario: Validate function calling
- **WHEN** a request includes function definitions for a model without function calling
- **THEN** the system SHALL return a 400 error
- **AND** return an error message "Model {model_id} does not support function calling"

### Requirement: Model Listing
The system SHALL provide a list of available models.

#### Scenario: List active models
- **WHEN** a request is made to GET /v1/models
- **THEN** the system SHALL return all active models
- **AND** include model ID, name, context window, and pricing
- **AND** exclude disabled or internal models

#### Scenario: Filter by capability
- **WHEN** a request includes capability filter (e.g., ?capability=vision)
- **THEN** the system SHALL return only models supporting that capability
- **AND** include capability information in the response
