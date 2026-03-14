# LLM Proxy Spec

## ADDED Requirements

### Requirement: OpenAI-Compatible API
The system SHALL expose OpenAI-compatible endpoints for chat completions and model listing.

#### Scenario: Chat completions endpoint
- **WHEN** a request is made to POST /v1/chat/completions with valid parameters
- **THEN** the system SHALL validate the API key
- **THEN** check and deduct credits
- **THEN** route the request to the appropriate LLM provider
- **AND** return the response in OpenAI-compatible format

#### Scenario: List models endpoint
- **WHEN** a request is made to GET /v1/models
- **THEN** the system SHALL return a list of available models
- **AND** include model ID, name, and pricing information
- **AND** format the response according to OpenAI API specification

#### Scenario: Streaming response
- **WHEN** a chat completion request includes `stream: true`
- **THEN** the system SHALL return a Server-Sent Events (SSE) stream
- **AND** stream tokens as they are received from the LLM provider
- **AND** calculate final usage at the end of the stream

### Requirement: Multi-Provider Support
The system SHALL support multiple LLM providers and route requests appropriately.

#### Scenario: Route to OpenAI
- **WHEN** a request specifies a model starting with "gpt-" or "o1" or "o3"
- **THEN** the system SHALL route the request to OpenAI API
- **AND** use the appropriate model identifier

#### Scenario: Route to Anthropic
- **WHEN** a request specifies a model starting with "claude-"
- **THEN** the system SHALL route the request to Anthropic API
- **AND** transform the request format if necessary

#### Scenario: Route to Google
- **WHEN** a request specifies a model starting with "gemini-"
- **THEN** the system SHALL route the request to Google Gemini API
- **AND** transform the request format if necessary

#### Scenario: Unsupported model
- **WHEN** a request specifies a model not supported by the system
- **THEN** the system SHALL return a 400 error
- **AND** return an error message "Model {model_id} is not supported"
- **AND** include a list of available models

### Requirement: Request/Response Transformation
The system SHALL transform requests and responses between OpenAI format and provider-specific formats.

#### Scenario: Transform Anthropic request
- **WHEN** routing a request to Anthropic
- **THEN** the system SHALL convert OpenAI message format to Anthropic format
- **AND** map system messages to Anthropic system parameter
- **AND** preserve all message content and roles

#### Scenario: Transform Anthropic response
- **WHEN** receiving a response from Anthropic
- **THEN** the system SHALL convert Anthropic response to OpenAI format
- **AND** include usage statistics (prompt_tokens, completion_tokens, total_tokens)
- **AND** format choices array with message content

### Requirement: Error Handling
The system SHALL handle errors from upstream providers gracefully.

#### Scenario: Provider rate limit
- **WHEN** an upstream provider returns a rate limit error (429)
- **THEN** the system SHALL return a 429 error to the client
- **AND** include retry-after header if provided by provider
- **AND** log the error for monitoring

#### Scenario: Provider authentication error
- **WHEN** an upstream provider returns an authentication error
- **THEN** the system SHALL return a 500 error to the client
- **AND** log the error with provider name for admin alerting
- **AND** not expose provider API key details

#### Scenario: Provider timeout
- **WHEN** an upstream provider does not respond within 60 seconds
- **THEN** the system SHALL return a 504 Gateway Timeout error
- **AND** refund any deducted credits for the failed request
