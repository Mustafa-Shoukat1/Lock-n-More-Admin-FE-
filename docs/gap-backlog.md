# Gap Backlog (Build Remaining Work)

## P0 Critical
- Align backend env example with required runtime variables.
- Remove secret sprawl risk and enforce safe secret management.
- Replace frontend local-only auth/session assumptions with backend auth integration.
- Implement frontend API layer and migrate Inbox core flows from local storage to backend data.
- Add webhook idempotency verification coverage for messaging and Stripe.

## P1 High
- Connect frontend products/orders/analytics to backend endpoints.
- Add frontend socket client for real-time updates.
- Standardize backend error response shape for all controllers.
- Add structured logging context (request ID, channel, user ID).

## P2 Medium
- Add pagination and filtering strategy for large conversation volumes.
- Improve AI response safety and fallback logic consistency.
- Add admin controls for integration status visibility.

## P3 Enhancement
- Semantic product retrieval enhancement (pgvector plan exists as TODO).
- Performance dashboards with deeper historical slicing.

## Out of Scope for First Go-Live
- Advanced analytics beyond core operator KPIs.
- Non-essential UI animation or visual redesign.
