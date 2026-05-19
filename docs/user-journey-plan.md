# User Journey Plan

## Journey 1: Staff Login and Session Start
### Goal
Agent logs in and accesses permitted modules.
### Required Build
- Frontend login page to backend auth endpoint.
- JWT handling and route guard alignment.
### Done When
- Valid user logs in and receives role-appropriate access.

## Journey 2: Inbox Receive and Reply
### Goal
Agent sees inbound message and sends reply from one interface.
### Required Build
- Conversation list and message thread fetched from backend.
- Send message calls backend by platform route.
- Message status updates reflected in UI.
### Done When
- Message appears in DB and UI with correct participant and timestamp.

## Journey 3: Human Takeover and Assignment
### Goal
Supervisor assigns conversation and AI can be toggled per conversation.
### Required Build
- Assignment endpoint integration.
- Toggle AI endpoint integration.
- Permission checks by role.
### Done When
- Assignment and AI toggle persist across refresh and users.

## Journey 4: Product-Aware Sales Flow
### Goal
Agent or AI references real product data.
### Required Build
- Products page wired to backend products endpoint.
- Shopify sync trigger and status visibility.
### Done When
- Product updates from Shopify are reflected in UI and AI context.

## Journey 5: Payment Completion
### Goal
Customer purchase intent results in checkout and completed order state.
### Required Build
- Checkout initiation path verified.
- Stripe webhook handling verified for order updates.
### Done When
- Test payment transitions order from pending to paid with audit logs.

## Journey 6: Notification and Monitoring
### Goal
Team receives system signals for key events.
### Required Build
- Notification endpoints wired in UI.
- Basic monitoring and alerts configured.
### Done When
- Critical events produce both in-app and operational visibility.
