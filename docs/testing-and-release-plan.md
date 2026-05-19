# Testing and Release Plan

## Test Layers
- Build layer: TypeScript and Vite build checks.
- API layer: Endpoint integration tests for critical controllers/services.
- Webhook layer: Fixture-based inbound payload tests and idempotency checks.
- UI layer: Page smoke tests and key action tests.
- End-to-end layer: Operator journeys on staging.

## Baseline Current Result
- Build checks pass for backend and frontend.
- Automated test suites are not established yet.

## Immediate Test Setup Tasks
- Backend: add test framework and integration test harness.
- Frontend: add test runner and basic page render tests.
- Add CI workflow steps for build and test.

## Mandatory Smoke Suite Before Each Release
- Health endpoint check.
- Auth login success/failure cases.
- WhatsApp webhook receive and message persistence.
- Outbound send endpoint success path.
- Shopify sync and product retrieval path.
- Stripe webhook event handling for success and failure.

## Regression Checklist
- Role-based access checks.
- Conversation assignment and AI toggle behavior.
- Notification read/unread flows.
- Media upload retrieval path.

## Release Gates
- Gate 1: Build and test pass.
- Gate 2: Staging smoke pass.
- Gate 3: Monitoring dashboards green.
- Gate 4: Rollback drill passed.

## Reporting Template Per Release
- Scope shipped
- Risks accepted
- Tests passed and failed
- Rollback plan reference
- Post-release validation outcome
