# Laminar Production Test Checklist

Use this checklist to verify the system in production order.

## 1. Auth and RBAC
- [ ] Log in as `super_admin`
- [ ] Log in as `admin`
- [ ] Log in as `agent`
- [ ] Confirm unauthenticated users are redirected to login
- [ ] Confirm role-gated pages are blocked for unauthorized roles
- [ ] Confirm session persists after refresh

Expected result:
- Role-based access works correctly and sessions remain stable.

## 2. WhatsApp Inbox
- [ ] Trigger an inbound WhatsApp webhook
- [ ] Confirm the message appears in the inbox
- [ ] Send an outbound reply
- [ ] Confirm message persistence in the database
- [ ] Verify AI reply toggle works
- [ ] Test image, audio, and video messages

Expected result:
- Inbound and outbound WhatsApp flows work end to end.

## 3. Instagram Inbox
- [ ] Trigger an inbound Instagram webhook
- [ ] Confirm the conversation appears in the inbox
- [ ] Send an outbound reply
- [ ] Confirm message persistence in the database
- [ ] Verify AI response generation
- [ ] Test media and attachment handling

Expected result:
- Instagram conversations and replies sync properly.

## 4. TikTok Inbox
- [ ] Complete TikTok OAuth callback
- [ ] Confirm conversations load in the inbox
- [ ] Trigger an inbound TikTok message
- [ ] Send an outbound TikTok reply
- [ ] Confirm AI response generation
- [ ] Confirm performance metrics are recorded

Expected result:
- TikTok conversations, replies, and metrics work correctly.

## 5. OpenAI AI Flow
- [ ] Request an AI draft from a conversation
- [ ] Confirm backend OpenAI response returns successfully
- [ ] Run sentiment analysis on a customer message
- [ ] Confirm no frontend Gemini key is required

Expected result:
- AI runs through the backend OpenAI path only.

## 6. Shopify Sync
- [ ] Run Shopify product sync
- [ ] Confirm products load in the frontend
- [ ] Confirm search and filtering work
- [ ] Confirm variants and inventory values are correct
- [ ] Confirm AI can reference product data

Expected result:
- Shopify catalog data is available and accurate.

## 7. Stripe Payments
- [ ] Create a checkout session from the inbox
- [ ] Confirm hosted checkout opens correctly
- [ ] Complete a test payment
- [ ] Confirm webhook updates order status
- [ ] Confirm payment notifications appear

Expected result:
- Checkout and webhook flow complete successfully.

## 8. Notifications
- [ ] Trigger a lead notification
- [ ] Trigger a message notification
- [ ] Trigger an order notification
- [ ] Trigger a system notification
- [ ] Confirm unread badge updates
- [ ] Confirm mark-as-read works

Expected result:
- Notifications appear and clear correctly.

## 9. Analytics and Performance
- [ ] Open the analytics dashboard
- [ ] Confirm charts load without errors
- [ ] Confirm agent performance data is visible
- [ ] Confirm WhatsApp, Instagram, and TikTok metrics appear
- [ ] Confirm tables remain usable on smaller screens

Expected result:
- Analytics and performance reporting are visible and responsive.

## 10. Mobile QA
- [ ] Test the app at 360px width
- [ ] Test the app at tablet widths
- [ ] Confirm the bottom dock navigation works
- [ ] Confirm inbox chat flow is usable on mobile
- [ ] Confirm product, settings, and analytics pages remain readable
- [ ] Confirm login works on mobile

Expected result:
- The UI is usable and polished on phones.

## Production Readiness Notes
- Backend and frontend builds currently pass.
- OpenAI is wired through the backend.
- TikTok response metrics are now included in the unified flow.
- Live external verification is still required for WhatsApp, Instagram, TikTok, Shopify, Stripe, and PostgreSQL.
