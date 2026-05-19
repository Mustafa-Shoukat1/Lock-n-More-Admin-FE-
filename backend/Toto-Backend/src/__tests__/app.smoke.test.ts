import request from 'supertest';
import type { Express } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';

const testEnv: Record<string, string> = {
  PORT: '5000',
  DATABASE_URL: 'postgres://test:test@localhost:5432/test',
  OPENAI_API_KEY: 'test-key',
  SHOPIFY_CLIENT_ID: 'test',
  SHOPIFY_CLIENT_SECRET: 'test',
  SHOPIFY_CATALOG_APP_ID: 'test',
  SHOPIFY_CATALOG_APP_SECRET: 'test',
  SHOPIFY_API_VERSION: '2024-01',
  SHOPIFY_STORE_DOMAIN: 'example.myshopify.com',
  SHOPIFY_ACCESS_TOKEN: 'test',
  WHATSAPP_ACCESS_TOKEN: 'test',
  WHATSAPP_PHONE_NUMBER_ID: 'test',
  DO_SPACES_ENDPOINT: 'https://example.digitaloceanspaces.com',
  DO_SPACES_KEY: 'test',
  DO_SPACES_SECRET: 'test',
  DO_SPACES_BUCKET: 'test-bucket',
  JWT_SECRET: 'test-secret',
  TIKTOK_ACCESS_TOKEN: 'test',
  TIKTOK_CLIENT_ID: 'test',
  TIKTOK_CLIENT_SECRET: 'test',
  STRIPE_SECRET_KEY: 'test',
  STRIPE_WEBHOOK_SECRET: 'test',
  FRONTEND_URL: 'http://localhost:3000',
};

Object.assign(process.env, testEnv);

let app: Express;

beforeAll(async () => {
  const appModule = await import('../app');
  app = appModule.default;
});

describe('App Smoke Tests', () => {
  it('GET /health responds with a valid status payload', async () => {
    const response = await request(app).get('/health');

    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('status');
    expect(['healthy', 'unhealthy']).toContain(response.body.status);
  });

  it('POST /auth/login validates required fields', async () => {
    const response = await request(app).post('/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Email and password are required',
    });
  });
});
