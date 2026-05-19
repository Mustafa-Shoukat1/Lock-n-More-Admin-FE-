-- Migration: Add product_variants table to store Shopify variant IDs and metadata
-- This is used to generate dynamic checkout URLs when a user confirms purchase intent.

CREATE TABLE IF NOT EXISTS product_variants (
    id BIGINT PRIMARY KEY,            -- Shopify Variant ID
    product_id BIGINT NOT NULL,       -- Shopify Product ID (references products.shopify_id)
    title VARCHAR(255),               -- Variant title (e.g. "Default Title", "Red / Large")
    price DECIMAL(10, 2),
    sku VARCHAR(255),
    inventory_quantity INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE, -- TRUE for the first/default variant
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants (product_id);
