# Old Scope of Work (Original End-to-End)

## Purpose
Document the original committed scope for this system so development, QA, and release stay aligned to what was promised.

## Core Goal
Deliver one centralized AI sales and support platform for Locks n More that handles customer conversations, product context, order/payment flow, and team operations from a single admin interface.

## In-Scope Deliverables

### 1) Platform Foundation
- Backend service running on Node.js and TypeScript.
- Frontend admin panel running on React and Vite.
- PostgreSQL database integration.
- Environment-based configuration for all services.

### 2) Authentication and Access
- Login flow for staff users.
- Role-based access model (super admin, admin, agent).
- Protected routes for operational modules.

### 3) Omnichannel Messaging Hub
- WhatsApp webhook receive and send flows.
- Instagram webhook receive and send flows.
- TikTok webhook receive and send flows.
- Unified conversation visibility in one inbox.
- Conversation assignment and AI toggle per thread.

### 4) AI Sales Assistant Layer
- AI-assisted reply generation for conversations.
- Brand-tone and response settings management.
- Product-context-aware responses using catalog data.
- Human takeover support where needed.

### 5) Shopify Commerce Integration
- Shopify connectivity and shop ping.
- Product sync to local database.
- Product and variant data usable by UI and AI responses.

### 6) Payment and Order Flow
- Stripe checkout session creation for purchase intent.
- Stripe webhook handling for payment status.
- Order state updates tied to payment lifecycle.

### 7) Media and File Handling
- Inbound media retrieval from messaging channels.
- Media upload/storage in Spaces-compatible object storage.
- Message records linked to media metadata.

### 8) Notifications and Agent Performance
- In-app notifications for important events.
- Agent performance metrics endpoints and tracking.
- Basic operational visibility for team leads.

### 9) Admin Operations and Documentation
- Settings management screens.
- User management screens.
- Basic in-app documentation page.
- Technical docs in docs folder for engineering execution.

## Out of Scope in Original Commitment
- Native mobile apps.
- Multi-tenant SaaS architecture.
- Advanced BI warehouse and executive analytics suite.
- Complex recommendation engine beyond baseline AI response support.
- Full enterprise SSO and IAM federation.

## End-to-End Acceptance Criteria (Original Scope)

### Functional Criteria
- Staff can log in and access authorized modules.
- Inbound and outbound messaging works for WhatsApp, Instagram, and TikTok.
- Inbox supports reading, replying, and assignment flows.
- Product data syncs from Shopify and is visible in system workflows.
- Purchase flow can generate Stripe checkout and process webhook result.
- Notifications and basic performance data are available.

### Technical Criteria
- Backend and frontend build successfully.
- Environment variables are fully documented and consistent.
- Database migrations are runnable and validated.
- Core error handling and logging are in place.

### Quality Criteria
- Critical user journeys pass smoke tests.
- No P0 security or data-integrity blockers remain.
- Staging environment is validated before production release.

## Original Milestone Shape (High-Level)
- Milestone A: Foundation and auth.
- Milestone B: Messaging channel integration.
- Milestone C: AI and catalog integration.
- Milestone D: Payment and order lifecycle.
- Milestone E: QA hardening, docs, and release readiness.

## Ownership Model for Completion
- Product owner: scope sign-off and acceptance.
- Backend owner: integrations, data, webhooks, payments.
- Frontend owner: operational UI and API wiring.
- QA owner: smoke/regression and release gate checks.
- DevOps owner: secure deploy, monitoring, and rollback.

## Notes
This file defines the original scope boundary only. Current progress and updated plan remain documented in:
- docs/current-status.md
- docs/master-delivery-plan.md
- docs/gap-backlog.md
- docs/testing-and-release-plan.md
