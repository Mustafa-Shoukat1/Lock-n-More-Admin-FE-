import { shopifyApi, ApiVersion, Shopify } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { config } from './env';
import { logger } from '../utils/logger';

// Map string version to ApiVersion enum if possible, or cast
const apiVersion = config.shopify.apiVersion as ApiVersion || ApiVersion.January26;
const appHostName = (() => {
    try {
        return new URL(process.env.FRONTEND_URL || 'http://localhost:3000').host;
    } catch {
        return 'localhost:3000';
    }
})();

export const shopify: Shopify = shopifyApi({
    apiKey: config.shopify.clientId,
    apiSecretKey: config.shopify.clientSecret,
    scopes: ['read_products', 'read_inventory', 'read_locations'], // Expanded scopes for inventory
    hostName: appHostName,
    apiVersion: apiVersion,
    isEmbeddedApp: false,
});

logger.info(`Shopify SDK initialized with version: ${apiVersion}`);
