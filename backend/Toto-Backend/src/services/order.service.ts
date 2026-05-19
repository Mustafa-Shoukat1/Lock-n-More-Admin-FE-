import pool from '../config/db.config';

export interface CreateOrderParams {
  userId: string;
  platform: string;
  productId: number;
  variantId: number;
  price: number;
  quantity?: number;
}

export class OrderService {
  async createOrder(params: CreateOrderParams) {
    const { userId, platform, productId, variantId, price, quantity = 1 } = params;
    
    const query = `
      INSERT INTO orders (user_id, platform, product_id, variant_id, price, quantity, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, platform, productId, variantId, price, quantity]);
    return result.rows[0];
  }

  async updateOrderStatus(orderId: number, status: string, stripeSessionId?: string, paymentIntentId?: string) {
    const query = `
      UPDATE orders
      SET status = $1, 
          stripe_session_id = COALESCE($2, stripe_session_id), 
          stripe_payment_intent_id = COALESCE($3, stripe_payment_intent_id), 
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, stripeSessionId || null, paymentIntentId || null, orderId]);
    return result.rows[0];
  }

  async getOrder(orderId: number) {
    const query = `SELECT * FROM orders WHERE id = $1`;
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }
}
