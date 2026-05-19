import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const nodeEnv = process.env.NODE_ENV || 'development';
const envCandidates = [
    `.env.${nodeEnv}.local`,
    '.env.local',
    `.env.${nodeEnv}`,
    '.env'
];

const resolvedEnvPath = envCandidates
    .map((candidate) => path.resolve(process.cwd(), candidate))
    .find((candidatePath) => fs.existsSync(candidatePath));

if (resolvedEnvPath) {
    dotenv.config({ path: resolvedEnvPath });
} else {
    dotenv.config();
}

const requiredEnvVars = [
    'PORT',
    'DATABASE_URL',
    // AI
    'OPENAI_API_KEY',
    // Shopify
    'SHOPIFY_CLIENT_ID',
    'SHOPIFY_CLIENT_SECRET',
    'SHOPIFY_CATALOG_APP_ID',
    'SHOPIFY_CATALOG_APP_SECRET',
    'SHOPIFY_API_VERSION',
    'SHOPIFY_STORE_DOMAIN',
    'SHOPIFY_ACCESS_TOKEN',
    // WhatsApp
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_VERIFY_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    // Instagram
    'INSTAGRAM_ACCESS_TOKEN',
    'INSTAGRAM_ACCOUNT_ID',
    'INSTAGRAM_VERIFY_TOKEN',
    // Storage (Spaces)
    'DO_SPACES_ENDPOINT',
    'DO_SPACES_KEY',
    'DO_SPACES_SECRET',
    'DO_SPACES_BUCKET',
    // Security
    'JWT_SECRET',
    // TikTok
    'TIKTOK_CLIENT_ID',
    'TIKTOK_CLIENT_SECRET',
    'TIKTOK_REDIRECT_URI',
    'FRONTEND_URL'
];

const productionOnlyEnvVars = [
    // TikTok runtime token is generated via OAuth and may be absent in local dev
    'TIKTOK_ACCESS_TOKEN',
    // Stripe secrets are only required when payment flows are enabled
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

const checkEnv = () => {
    const missingRequired = requiredEnvVars.filter((key) => !process.env[key]);
    const missingProductionOnly = productionOnlyEnvVars.filter((key) => !process.env[key]);

    if (missingRequired.length > 0) {
        logger.error(`Missing required environment variables: ${missingRequired.join(', ')}`);
        process.exit(1);
    }

    if (nodeEnv === 'production' && missingProductionOnly.length > 0) {
        logger.error(`Missing required production environment variables: ${missingProductionOnly.join(', ')}`);
        process.exit(1);
    }

    if (nodeEnv !== 'production' && missingProductionOnly.length > 0) {
        logger.warn(`Optional in ${nodeEnv}: ${missingProductionOnly.join(', ')}. Related integrations will be unavailable.`);
    }
};

checkEnv();

export const config = {
    port: process.env.PORT || 5000,
    shopify: {
        clientId: process.env.SHOPIFY_CLIENT_ID!,
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET!,
        catalogAppId: process.env.SHOPIFY_CATALOG_APP_ID!,
        catalogAppSecret: process.env.SHOPIFY_CATALOG_APP_SECRET!,
        apiVersion: process.env.SHOPIFY_API_VERSION!,
        storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
    },
};
