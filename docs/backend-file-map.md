# Backend File Map

Root: backend/Toto-Backend

## Root Files
- app.js: Legacy JS entry helper.
- package.json: Dependencies and scripts (build, dev, start, migrate).
- tsconfig.json: TypeScript compiler settings.
- docker-compose.yml: Local container orchestration.
- Dockerfile: Backend container build instructions.
- .env.example: Sample environment variables (needs alignment with runtime expectations).
- simulate_webhook.ts: Utility to simulate inbound webhook payloads.

## Source Entrypoints
- src/server.ts: Backend process bootstrap, DB init, Socket.IO wiring, cleanup scheduler.
- src/app.ts: Express app setup, middleware chain, route mounting, Swagger UI, global error handler.

## Config
- src/config/env.ts: Required env validation and typed config object.
- src/config/db.config.ts: PostgreSQL pool configuration.
- src/config/shopify.config.ts: Shopify settings loading.
- src/config/spaces.config.ts: DigitalOcean Spaces S3 client initialization.
- src/config/swagger.config.ts: OpenAPI/Swagger configuration.

## Adapters
- src/adapters/MessagingAdapter.ts: Common messaging abstraction contract.
- src/adapters/TikTokAdapter.ts: TikTok-specific adapter implementation.

## Clients
- src/clients/shopify.client.ts: Shopify API client wrapper.

## Routes
- src/routes/health.routes.ts: Health check endpoints.
- src/routes/auth.routes.ts: Authentication endpoints.
- src/routes/user.routes.ts: User management endpoints.
- src/routes/whatsapp.routes.ts: WhatsApp send/webhook/contact/conversation endpoints.
- src/routes/instagram.routes.ts: Instagram webhook/messaging/conversation endpoints.
- src/routes/tiktok.routes.ts: TikTok webhook/callback/messaging endpoints.
- src/routes/shopify.routes.ts: Shopify ping/sync/fetch endpoints.
- src/routes/stripe.routes.ts: Stripe webhook endpoint.
- src/routes/notification.routes.ts: Notification endpoints.
- src/routes/aiSettings.routes.ts: AI settings endpoints.
- src/routes/agentPerformance.routes.ts: Agent metrics/performance endpoints.

## Controllers
- src/controllers/health.controller.ts: Health responses.
- src/controllers/auth.controller.ts: Login/token/auth workflows.
- src/controllers/user.controller.ts: User CRUD and admin operations.
- src/controllers/whatsapp.controller.ts: WhatsApp request handling and orchestration.
- src/controllers/instagram.controller.ts: Instagram webhook and messaging orchestration.
- src/controllers/tiktok.controller.ts: TikTok callback/webhook/messaging orchestration.
- src/controllers/shopify.controller.ts: Shopify sync and retrieval orchestration.
- src/controllers/stripeWebhook.controller.ts: Stripe event parsing and dispatch.
- src/controllers/notification.controller.ts: Notification workflows.
- src/controllers/aiSettings.controller.ts: AI config read/update handlers.
- src/controllers/agentPerformance.controller.ts: Performance metric endpoint handlers.

## Services
- src/services/auth.service.ts: JWT and authentication business logic.
- src/services/user.service.ts: User business logic and seed operations.
- src/services/whatsapp.service.ts: WhatsApp API calls, conversation/session persistence, media pipeline.
- src/services/instagram.service.ts: Instagram messaging/session operations.
- src/services/tiktok.service.ts: TikTok messaging and token operations.
- src/services/shopify.service.ts: Shopify fetch, product sync, and local product retrieval.
- src/services/ai.service.ts: AI response generation, context retrieval, intent detection, checkout trigger.
- src/services/order.service.ts: Internal order creation/update operations.
- src/services/payment.service.ts: Stripe checkout and webhook validation logic.
- src/services/mediaUpload.service.ts: Upload media to Spaces.
- src/services/notification.service.ts: Notification create/read/cleanup operations.
- src/services/agentPerformance.service.ts: Agent KPI tracking and aggregation.

## Models
- src/models/user.model.ts: User domain typing/model helpers.
- src/models/aiSettings.model.ts: AI settings domain typing/model helpers.

## Middlewares
- src/middlewares/auth.middleware.ts: Bearer token guard and user context injection.
- src/middlewares/errorHandler.ts: Unified error response formatting.

## Utilities
- src/utils/logger.ts: Logging utility abstraction.
- src/utils/initDb.ts: Startup database initialization checks.

## Scripts
- scripts/migrate.ts: Migration runner script.
- scripts/run_perf_migration.ts: Performance migration script.
- scripts/create_tables_products.ts: Product table creation utility.
- scripts/count_products.ts: Product count debug utility.
- scripts/test-ping-sync.ts: Shopify ping/sync test script.
- scripts/test-product-sync.ts: Product sync verification script.
- scripts/test-upload.ts: Media upload verification script.
- scripts/debug_session.ts: Session debug script.
- scripts/debug_performance.ts: Performance debug script.
- scripts/verify_timezone_fix.ts: Timezone fix verification script.
- scripts/add_document_enum.ts: Enum extension helper for message type support.

## Migrations
- migrations/instagram_setup.sql: Instagram schema initialization.
- migrations/tiktok_setup.sql: TikTok schema initialization.
- migrations/stripe_orders_setup.sql: Orders + Stripe linkage schema.
- migrations/product_variants_setup.sql: Product variant schema.
- migrations/notifications_setup.sql: Notifications schema.
- migrations/performance_tracking_setup.sql: Agent metrics schema.
- migrations/update_notification_enum.sql: Notification enum updates.
- migrations/fix_timezone_metrics.sql: Timezone correction for metrics.
- migrations/fix_performance_metrics_uuid.sql: UUID-related metrics fix.
- migrations/fix_performance_metrics_message_ids.sql: Message ID linkage fix for performance data.

## Data and Static
- data/contacts.json: Local contacts seed/debug data.
- data/conversations.json: Local conversations seed/debug data.
- public/index.html: Static public landing for backend root static serving.
