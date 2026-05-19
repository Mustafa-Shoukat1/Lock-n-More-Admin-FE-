# Master Delivery Plan

## Objective
Take the current codebase from compile-ready to production-ready with a clear, testable, and staged execution plan.

## Phase 1: Stabilize Foundation
Target: 2 to 4 days

### Deliverables
- Environment variable contract unified.
- Sanitized env templates finalized for backend and frontend.
- Secret rotation checklist completed.
- Frontend API client scaffold created (auth, base URL, error handling).

### Acceptance Criteria
- No env naming mismatches between code and examples.
- All runtime secrets loaded only from environment.
- Backend starts cleanly with validated config.

## Phase 2: Wire Core User Journeys
Target: 4 to 7 days

### Deliverables
- Frontend login wired to backend auth.
- Inbox conversation list/messages wired to backend endpoints.
- Send message flow wired for WhatsApp and one secondary channel first.
- Product list page wired to backend products endpoint.

### Acceptance Criteria
- Operator can log in, open inbox, read messages, send reply.
- Data persists in backend, not only local storage.

## Phase 3: Integration Completion
Target: 4 to 8 days

### Deliverables
- Instagram and TikTok flows validated end to end.
- Shopify sync and read path validated from UI to backend to DB.
- Stripe checkout/webhook lifecycle validated with test events.
- Media upload path validated for inbound and outbound messages.

### Acceptance Criteria
- All external integrations have passing smoke tests.
- Failures are logged with actionable diagnostics.

## Phase 4: Quality Gates and Reliability
Target: 3 to 6 days

### Deliverables
- Backend integration test baseline.
- Frontend component/page smoke test baseline.
- API error contract standardization.
- Retry/idempotency checks for webhook handlers.

### Acceptance Criteria
- Automated test pipeline executes and reports pass/fail.
- Critical path regression checklist passes.

## Phase 5: Production Readiness
Target: 2 to 4 days

### Deliverables
- Monitoring and alert rules configured.
- Backup and restore test completed.
- Runbooks created for incident and rollback.
- Staging sign-off and go-live checklist completed.

### Acceptance Criteria
- Go-live checklist is fully green.
- Team can rollback safely within agreed RTO.

## Priority Rules
- P0: Security, auth, data integrity, payment correctness.
- P1: Core inbox and response reliability.
- P2: UX refinement and performance optimization.

## Working Agreement
- No new feature starts without acceptance criteria.
- Every merged change must include verification evidence.
- Keep docs updated as source of truth per phase.
