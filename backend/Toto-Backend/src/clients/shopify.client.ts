import { shopify } from '../config/shopify.config';
import { config } from '../config/env';
import { Session } from '@shopify/shopify-api';

export class ShopifyClient {
    private session: Session;

    constructor() {
        // Construct a session for offline access (since we have a permanent token for now)
        // In OAuth, this would be dynamic.
        this.session = shopify.session.customAppSession(config.shopify.storeDomain);

        // Manually set the access token from env for this temporary phase
        this.session.accessToken = config.shopify.accessToken;
    }

    public getClient() {
        return new shopify.clients.Rest({
            session: this.session,
        });
    }

    public getSession() {
        return this.session;
    }
}
