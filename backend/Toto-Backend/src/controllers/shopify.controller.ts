import type { Request, Response, NextFunction } from 'express';
import { ShopifyService } from '../services/shopify.service';

const shopifyService = new ShopifyService();

export const ping = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shop, products, collections } = await shopifyService.pingShop();

        res.status(200).json({
            status: 'ok',
            data: {
                store: shop.name, // Mapping 'shop.name' to 'store' as per requirements
                domain: shop.domain,
                products: products,
                collections: collections,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const syncProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ status: 'error', message: 'Body must be an array of products' });
        }

        const result = await shopifyService.syncProducts(products);

        res.status(200).json({
            status: 'ok',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await shopifyService.getStoredProducts();

        res.status(200).json({
            status: 'ok',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await shopifyService.getOrders();
        res.status(200).json({ status: 'ok', data: orders });
    } catch (error) {
        next(error);
    }
};
