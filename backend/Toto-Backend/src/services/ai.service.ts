import OpenAI from 'openai';
import pool from '../config/db.config';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

type AIResponseSettings = {
    personality?: string;
    tone?: string;
    responseLength?: number;
    creativity?: number;
};

export class AIService {
    private openai: OpenAI;
    private orderService: OrderService;
    private paymentService: PaymentService;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.orderService = new OrderService();
        this.paymentService = new PaymentService();
    }

    async getResponseSuggestion(conversationContext: string, customerQuery: string, settings: AIResponseSettings = {}): Promise<string> {
        try {
            const responseLength = Math.max(20, Math.min(100, settings.responseLength ?? 60));
            const creativity = Math.max(0, Math.min(100, settings.creativity ?? 50));
            const temperature = 0.2 + (creativity / 100) * 0.8;

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                temperature,
                max_tokens: Math.max(80, Math.min(400, Math.round(responseLength * 4))),
                messages: [
                    {
                        role: 'system',
                        content: [
                            "You are TOTO AI for 'Locks N More', a premium smart lock retailer.",
                            `Personality: ${settings.personality || 'professional'}.`,
                            `Tone: ${settings.tone || 'clear and helpful'}.`,
                            `Length target: about ${responseLength}% of a normal reply.`,
                            'Write a concise, helpful sales or support response that sounds natural in chat.',
                            'Use bold text only when it helps highlight product names or prices.',
                        ].join(' '),
                    },
                    {
                        role: 'user',
                        content: `Conversation context:\n${conversationContext}\n\nCustomer message:\n${customerQuery}`,
                    },
                ],
            });

            return completion.choices[0]?.message?.content?.trim() || "I'm processing your request. One moment please.";
        } catch (error: any) {
            console.error('Error generating AI suggestion:', error.message);
            return "I'm having trouble generating a response right now.";
        }
    }

    async analyzeSentiment(text: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                temperature: 0,
                max_tokens: 10,
                messages: [
                    {
                        role: 'system',
                        content: 'Analyze the customer message and return only one word: Positive, Neutral, Negative, or Frustrated.',
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
            });

            const raw = completion.choices[0]?.message?.content?.trim() || 'Neutral';
            const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
            if (['Positive', 'Neutral', 'Negative', 'Frustrated'].includes(normalized)) {
                return normalized;
            }
            return 'Neutral';
        } catch (error: any) {
            console.error('Error analyzing sentiment:', error.message);
            return 'Neutral';
        }
    }

    async getChatContext(sessionId: string, limit: number = 10, platform: string = 'whatsapp'): Promise<string> {
        try {
            let table = 'messages';
            let payloadTable = 'message_payloads';

            if (platform === 'instagram') {
                table = 'instagram_messages';
                payloadTable = 'instagram_message_payloads';
            } else if (platform === 'tiktok') {
                table = 'tiktok_messages';
                payloadTable = 'tiktok_message_payloads';
            }

            const query = `
                SELECT m.direction, m.type, p.content
                FROM ${table} m
                JOIN ${payloadTable} p ON m.id = p.message_id
                WHERE m.session_id = $1
                ORDER BY m.created_at DESC
                LIMIT $2
            `;
            const result = await pool.query(query, [sessionId, limit]);

            // Reverse to get chronological order
            const messages = result.rows.reverse();

            return messages.map(msg => {
                const role = msg.direction === 'inbound' ? 'User' : 'Assistant';
                const content = msg.content?.text || `[${msg.type} message]`;
                return `${role}: ${content}`;
            }).join('\n');
        } catch (error: any) {
            console.error(`Error fetching chat context for ${platform}:`, error.message);
            return "";
        }
    }

    async findRelevantProducts(query: string, limit: number = 5): Promise<string> {
        try {
            // Simple keyword search for now. 
            // TODO: Upgrade to pgvector for semantic search.
            // We split query into words and look for ANY match in chunk_content or product title
            const searchTerms = query.split(/\s+/).filter(term => term.length > 2).map(term => `%${term}%`);

            if (searchTerms.length === 0) return "";

            const sqlQuery = `
                SELECT DISTINCT p.title, pc.chunk_content
                FROM product_chunks pc
                JOIN products p ON pc.product_id = p.shopify_id
                WHERE ${searchTerms.map((_, i) => `pc.chunk_content ILIKE $${i + 1} OR p.title ILIKE $${i + 1}`).join(' OR ')}
                LIMIT $${searchTerms.length + 1}
            `;

            const result = await pool.query(sqlQuery, [...searchTerms, limit]);

            return result.rows.map(row => `Product: ${row.title}\nInfo: ${row.chunk_content}`).join('\n\n');
        } catch (error: any) {
            console.error('Error finding relevant products:', error.message);
            return "";
        }
    }

    /**
     * Detects if the user has expressed purchase intent.
     * Returns the product name they mentioned (or null if no intent detected).
     */
    async detectPurchaseIntent(message: string, chatHistory: string): Promise<{ hasPurchaseIntent: boolean; productName: string | null }> {
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `You are a Purchase Intent Detector. Determine if the user is expressing clear intent to BUY a specific product right now.

Respond with a JSON object ONLY, no extra text:
{ "hasPurchaseIntent": true/false, "productName": "exact product name from the conversation or null" }

TRUE examples: "I want to buy this", "I'll take it", "Add to cart", "I want to purchase", "Yes, buy it", "I want to order", "Checkout", "I want this one".
FALSE examples: asking price, asking features, browsing, general questions, comparisons.

If intent is true, productName must be the product the user is referring to based on context. If unclear, set to null.`
                    },
                    {
                        role: 'user',
                        content: `Chat History:\n${chatHistory}\n\nLatest User Message: ${message}`
                    }
                ],
                model: 'gpt-4o',
                temperature: 0,
                response_format: { type: 'json_object' }
            });

            const raw = completion.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(raw);
            return {
                hasPurchaseIntent: parsed.hasPurchaseIntent === true,
                productName: parsed.productName || null
            };
        } catch (error: any) {
            console.error('Error detecting purchase intent:', error.message);
            return { hasPurchaseIntent: false, productName: null };
        }
    }

    /**
     * Given a product name (from intent detection or recent context),
     * looks up the product in the DB and returns handle + default variant ID.
     */
    async getProductCheckoutData(productName: string): Promise<{ 
        shopify_id: string;
        handle: string; 
        variantId: string | null;
        title: string;
        variant_title: string;
        price: number;
        image_url: string;
    } | null> {
        try {
            // Search for the closest matching product by title
            const result = await pool.query(
                `SELECT 
                    p.shopify_id, 
                    p.handle, 
                    p.title,
                    p.image_url,
                    v.id AS variant_id,
                    v.title AS variant_title,
                    v.price
                 FROM products p
                 LEFT JOIN product_variants v ON v.product_id = p.shopify_id AND v.is_default = TRUE
                 WHERE p.title ILIKE $1
                 LIMIT 1`,
                [`%${productName}%`]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return {
                shopify_id: String(row.shopify_id),
                handle: row.handle,
                variantId: row.variant_id ? String(row.variant_id) : null,
                title: row.title,
                variant_title: row.variant_title,
                price: parseFloat(row.price),
                image_url: row.image_url
            };
        } catch (error: any) {
            console.error('Error looking up product for checkout:', error.message);
            return null;
        }
    }

    /**
     * Generates a Shopify checkout URL.
     * Uses cart permalink if variant ID is available, otherwise product page URL.
     */
    generateShopifyCheckoutUrl(handle: string, variantId: string | null, quantity: number = 1): { productUrl: string; checkoutUrl: string | null } {
        const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || '';
        const productUrl = `https://${storeDomain}/products/${handle}`;
        const checkoutUrl = variantId
            ? `https://${storeDomain}/cart/${variantId}:${quantity}?channel=buy_button`
            : null;
        return { productUrl, checkoutUrl };
    }

    async rewriteQuery(history: string, message: string): Promise<string> {
        if (!history) return message;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a Query Refiner. Your job is to rewrite the user's last message into a standalone search query based on the chat history. \n\nExample:\nHistory: 'User: Do you have safes? Assistant: Yes, Brand A and Brand B.'\nLast Message: 'Which is cheaper?'\nOutput: 'Compare price of Brand A and Brand B safes'\n\nIf the message is already standalone (e.g. 'Hello'), output it exactly as is." },
                    { role: "user", content: `Chat History:\n${history}\n\nLast Message: ${message}\n\nStandalone Query:` }
                ],
                model: "gpt-4o",
                temperature: 0.3, // Low temp for more deterministic output
            });

            const rewritten = completion.choices[0]?.message?.content?.trim() || message;
            console.log(`original query: "${message}" -> rewritten query: "${rewritten}"`);
            return rewritten;
        } catch (error) {
            console.error('Error rewriting query:', error);
            return message;
        }
    }

    async generateResponse(
        sessionId: string, 
        message: string, 
        systemPrompt: string = "You are a helpful assistant for a business.",
        meta: { userId?: string, platform?: string } = {}
    ): Promise<string> {
        let retries = 3;
        while (retries > 0) {
            try {
                // 1. Get Context
                const chatHistory = await this.getChatContext(sessionId, 10, meta.platform);

                // 2. Detect purchase intent BEFORE rewriting or calling the main LLM
                const intentResult = await this.detectPurchaseIntent(message, chatHistory);
                if (intentResult.hasPurchaseIntent && intentResult.productName) {
                    console.log(`🛒 Purchase intent detected for: "${intentResult.productName}"`);
                    const productData = await this.getProductCheckoutData(intentResult.productName);

                    if (productData && productData.shopify_id && productData.variantId) {
                        // If we have meta info (platform/user), trigger Stripe checkout
                        if (meta.userId && meta.platform) {
                            console.log(`💳 Creating Stripe Checkout for ${meta.platform} user: ${meta.userId}`);
                            
                            const prodId = parseInt(productData.shopify_id);
                            const varId = parseInt(productData.variantId);

                            if (isNaN(prodId) || isNaN(varId)) {
                                console.error(`❌ Invalid IDs for product checkout: prodId=${productData.shopify_id}, varId=${productData.variantId}`);
                                return `I'm sorry, I'm having trouble processing the checkout for **${productData.title}**. Please try again later.`;
                            }

                            // 1. Create Internal Order
                            const order = await this.orderService.createOrder({
                                userId: meta.userId,
                                platform: meta.platform,
                                productId: prodId,
                                variantId: varId,
                                price: parseFloat(productData.price as any)
                            });

                            // 2. Generate Stripe Session
                            const stripeSession = await this.paymentService.createCheckoutSession({
                                orderId: order.id,
                                productId: prodId,
                                variantId: varId,
                                userId: meta.userId,
                                platform: meta.platform,
                                productTitle: productData.title,
                                variantTitle: productData.variant_title || 'Default',
                                price: parseFloat(productData.price as any),
                                imageUrl: productData.image_url
                            });

                            return `✅ Great choice! You can complete your purchase of the **${productData.title}** securely via Stripe here:\n\n${stripeSession.url}\n\nLet me know once you've paid!`;
                        }

                        // Fallback to Shopify URL if no meta info
                        const { productUrl, checkoutUrl } = this.generateShopifyCheckoutUrl(
                            productData.handle,
                            productData.variantId
                        );
                        const url = checkoutUrl || productUrl;
                        console.log(`✅ Checkout URL generated: ${url}`);
                        return `✅ You're all set! Click the link below to complete your purchase:\n${url}`;
                    } else {
                        console.warn(`⚠️ Purchase intent detected but product "${intentResult.productName}" not found in DB.`);
                    }
                }

                // 3. Rewrite Query (Smart Contextual Search)
                const searchQuery = await this.rewriteQuery(chatHistory, message);

                // 4. Get Product Info (RAG) using Rewritten Query
                const productContext = await this.findRelevantProducts(searchQuery);

                // 5. Get Active AI Setting
                let activePrompt = systemPrompt;
                try {
                    const settingResult = await pool.query('SELECT prompt FROM ai_settings WHERE is_active = TRUE LIMIT 1');
                    if (settingResult.rows.length > 0) {
                        activePrompt = settingResult.rows[0].prompt;
                    }
                } catch (err) {
                    console.error('Error fetching active AI setting:', err);
                }

                // 6. Construct System Prompt with product context
                let finalSystemPrompt = activePrompt;
                if (productContext) {
                    finalSystemPrompt += `\n\nRelevant Product Information:\n${productContext}\n\nUse this information to answer the user's question.`;
                }

                // 7. Call LLM for general response
                const completion = await this.openai.chat.completions.create({
                    messages: [
                        { role: "system", content: finalSystemPrompt },
                        { role: "user", content: `Previous Chat:\n${chatHistory}\n\nCurrent User Message: ${message}` }
                    ],
                    model: "gpt-4o",
                });

                return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
            } catch (error: any) {
                console.error(`Error generating AI response (Attempts left: ${retries - 1}):`, error.message);
                retries--;
                if (retries === 0) {
                    return "I am currently experiencing high traffic. Please try again later.";
                }
                // Wait 1s before retry
                await new Promise(res => setTimeout(res, 1000));
            }
        }
        return "I am currently experiencing high traffic. Please try again later.";
    }
}
