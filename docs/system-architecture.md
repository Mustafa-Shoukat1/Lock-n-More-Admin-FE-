# System Architecture

## High-Level Components
- Admin Frontend (React + Vite)
  - Operator UI for inbox, products, AI settings, analytics, users, and docs view.
- Backend API (Express + TypeScript)
  - Handles auth, messaging webhooks, outbound messaging, Shopify sync, Stripe payments, notifications, and performance metrics.
- PostgreSQL Database
  - Stores users, contacts, sessions, messages, payloads, products, variants, orders, notifications, and metrics.
- Third-Party Integrations
  - WhatsApp Business API
  - Instagram messaging/webhooks
  - TikTok messaging + callback
  - Shopify Admin API
  - Stripe checkout + webhook
  - OpenAI API
  - DigitalOcean Spaces (media storage)

## Backend Runtime Entry Flow
1. src/server.ts bootstraps the service.
2. src/config/env.ts validates required environment variables and exits on missing keys.
3. src/utils/initDb.ts initializes database schema checks.
4. src/services/user.service.ts seeds a super admin.
5. src/app.ts configures middleware and mounts routes.
6. Socket.IO server is attached for real-time message push.

## Request Flow Pattern
- Route layer in src/routes/*
- Controller layer in src/controllers/*
- Service layer in src/services/*
- Database access via src/config/db.config.ts and SQL queries in services

## Messaging Flow (Inbound)
1. Channel webhook endpoint receives payload.
2. Controller normalizes incoming data.
3. Service resolves contact/session and stores message + payload.
4. Media files are fetched and uploaded to Spaces when present.
5. Socket event is emitted to update clients.
6. AI response generation can be triggered depending on session settings.

## Messaging Flow (Outbound)
1. Admin sends message from UI to backend endpoint.
2. Controller validates payload.
3. Service sends through channel API.
4. Message and delivery state are persisted.

## Commerce Flow
- Shopify
  - Ping and product sync endpoints call Shopify client.
  - Product, image, chunk, and variant data are persisted for retrieval and AI context.
- Stripe
  - AI service can detect purchase intent and create checkout session through payment service.
  - Stripe webhook confirms payment status and updates order lifecycle.

## Frontend Runtime Flow
1. index.tsx mounts App.
2. App.tsx initializes context, role-gated routes, and local state persistence.
3. services/db.ts stores and loads app state in localStorage.
4. services/gemini.ts generates AI suggestions in the frontend simulation context.

## Known Architecture Gaps
- Environment variable naming mismatch exists between .env.example and runtime expectations.
- Backend test script is placeholder; no automated test baseline.
- Some frontend behavior is mock/local-state driven and should be aligned to backend APIs for production parity.
