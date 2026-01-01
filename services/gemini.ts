
import { GoogleGenAI } from "@google/genai";
import { db } from "./db";

export class GeminiService {
  /**
   * Generates a suggested response with full context of the product catalog.
   */
  async getAiResponseSuggestion(conversationContext: string, customerQuery: string) {
    try {
      const data = db.load();
      const productContext = data.products.map(p => `- ${p.name}: RM${p.price} (${p.stock > 0 ? 'In Stock' : 'Out of Stock'}, SKU: ${p.sku})`).join('\n');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
        SYSTEM ROLE: You are TOTO AI, the lead sales agent for 'Locks 'N More'. 
        TONE: Professional, helpful, and focused on closing sales.
        
        CURRENT PRODUCT CATALOG:
        ${productContext}

        CONVERSATION HISTORY:
        ${conversationContext}

        CUSTOMER QUERY: "${customerQuery}"

        TASK: Provide a concise WhatsApp-style response. If they ask about a product we have, mention the price and availability. If we don't have it, suggest the closest smart lock. Use bold text for product names.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "I'm processing your request. One moment please.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having trouble connecting to the catalog. Let me check that for you manually.";
    }
  }

  async analyzeSentiment(text: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze sentiment (Positive/Neutral/Negative) for: "${text}"`,
      });
      return (response.text || "Neutral").trim();
    } catch (error) {
      return "Neutral";
    }
  }
}

export const gemini = new GeminiService();
