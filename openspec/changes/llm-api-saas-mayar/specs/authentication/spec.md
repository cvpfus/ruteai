# Authentication Spec

## ADDED Requirements

### Requirement: Better Auth with Convex Integration
The system SHALL use Better Auth with `@convex-dev/better-auth` component as the authentication provider, running inside Convex.

#### Scenario: Better Auth server setup
- **WHEN** the application starts
- **THEN** Better Auth SHALL run as a Convex component (`convex/betterAuth/`)
- **AND** auth routes SHALL be mounted via `authComponent.registerRoutes(http, createAuth)` in `convex/http.ts`
- **AND** the auth instance SHALL use the Convex database adapter

#### Scenario: Client auth provider
- **WHEN** the React application renders
- **THEN** it SHALL be wrapped in `ConvexBetterAuthProvider` with the Better Auth client
- **AND** the client SHALL use `convexClient()` and `apiKeyClient()` plugins

### Requirement: Email/Password Authentication
The system SHALL support email and password authentication via Better Auth.

#### Scenario: User sign-up
- **WHEN** a new user submits email and password
- **THEN** the system SHALL call `authClient.signUp.email({ email, password, name })`
- **AND** Better Auth SHALL create a user record and session
- **AND** the user SHALL be redirected to the dashboard

#### Scenario: User sign-in
- **WHEN** an existing user submits email and password
- **THEN** the system SHALL call `authClient.signIn.email({ email, password })`
- **AND** Better Auth SHALL validate credentials and create a session
- **AND** the user SHALL be redirected to the dashboard

#### Scenario: Invalid credentials
- **WHEN** a user submits incorrect email or password
- **THEN** the system SHALL return an error without revealing which field is incorrect

### Requirement: Session Management
The system SHALL manage user sessions via Better Auth's session system.

#### Scenario: Active session
- **WHEN** a user has a valid session
- **THEN** the system SHALL allow access to protected routes
- **AND** `ctx.auth.getUserIdentity()` SHALL return the user identity in Convex functions

#### Scenario: Expired session
- **WHEN** a user's session expires
- **THEN** the system SHALL redirect the user to the sign-in page
- **AND** clear session cookies

#### Scenario: Sign out
- **WHEN** a user signs out
- **THEN** the system SHALL call `authClient.signOut()`
- **AND** invalidate the session
- **AND** redirect to the sign-in page

### Requirement: Protected Routes
The system SHALL protect dashboard routes from unauthenticated access.

#### Scenario: Unauthenticated access
- **WHEN** an unauthenticated user attempts to access a protected route
- **THEN** the system SHALL redirect to the sign-in page
- **AND** preserve the original URL for post-login redirect

#### Scenario: Authenticated access
- **WHEN** an authenticated user accesses a protected route
- **THEN** the system SHALL render the requested page
- **AND** provide the user identity to the page components
