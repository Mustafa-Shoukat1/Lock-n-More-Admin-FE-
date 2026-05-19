# Environment and Operations Checklist

## 1) Security First
- Rotate all leaked or shared credentials immediately.
- Do not commit runtime .env files.
- Keep only sanitized examples in source control.

## 2) Backend Environment Contract (Expected)
From src/config/env.ts and service usage:
- PORT
- DATABASE_URL
- JWT_SECRET
- OPENAI_API_KEY
- SHOPIFY_CLIENT_ID
- SHOPIFY_CLIENT_SECRET
- SHOPIFY_CATALOG_APP_ID
- SHOPIFY_CATALOG_APP_SECRET
- SHOPIFY_API_VERSION
- SHOPIFY_STORE_DOMAIN
- SHOPIFY_ACCESS_TOKEN
- WHATSAPP_ACCESS_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_VERIFY_TOKEN
- INSTAGRAM_ACCESS_TOKEN
- INSTAGRAM_ACCOUNT_ID
- INSTAGRAM_VERIFY_TOKEN
- TIKTOK_ACCESS_TOKEN
- TIKTOK_CLIENT_ID
- TIKTOK_CLIENT_SECRET
- TIKTOK_REDIRECT_URI
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- FRONTEND_URL
- DO_SPACES_REGION
- DO_SPACES_ENDPOINT
- DO_SPACES_KEY
- DO_SPACES_SECRET
- DO_SPACES_BUCKET

## 3) Frontend Environment Contract
Used by frontend build/runtime wiring:
- VITE_API_BASE_URL (backend API base, e.g. http://localhost:5000)

Recommended local files:
- frontend/Lock-n-More-Admin-FE-/.env.example (committed placeholders)
- frontend/Lock-n-More-Admin-FE-/.env.local (local machine values, not committed)

Recommended backend files:
- backend/Toto-Backend/.env.example (committed placeholders)
- backend/Toto-Backend/.env.local (local machine values, not committed)

## 4) Build and Run
Backend:
- npm install
- npm run dev

Frontend:
- npm install
- npm run dev

## 5) Database and Migration Readiness
- Validate DATABASE_URL points to correct environment.
- Run migration script and verify schema objects.
- Validate product and message related tables before traffic.

## 6) Functional Smoke Tests
- Health endpoint responds.
- Auth login works.
- Inbound webhook roundtrip persists messages.
- Outbound message send works per channel.
- Shopify product sync succeeds.
- Stripe webhook updates order state.

## 7) Deployment Readiness
- Separate dev/stage/prod environment sets.
- Configure process manager, logs, monitoring, and alerts.
- Verify CORS and webhook URLs for production domains.
