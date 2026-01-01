
import { GoogleGenAI } from "@google/genai";
import { db } from "./db";
import { AiSettings } from "../types";

export class GeminiService {
  /**
   * Generates a suggested response with full context of the product catalog.
   */
  async getAiResponseSuggestion(conversationContext: string, customerQuery: string, settings?: AiSettings) {
    try {
      const data = db.load();
      const currentSettings = settings || data.aiSettings;
      const productContext = data.products.map(p => `- ${p.name}: RM${p.price} (${p.stock > 0 ? 'In Stock' : 'Out of Stock'}, SKU: ${p.sku})`).join('\n');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Calculate temperature based on creativity (0-100 -> 0.1-1.2)
      const temperature = (currentSettings.creativity / 100) * 1.1 + 0.1;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
        SYSTEM ROLE: You are TOTO AI for 'Locks 'N More'. 
        PERSONALITY: ${currentSettings.personality}
        TONE: ${currentSettings.tone}
        LENGTH CONSTRAINT: Keep it roughly ${currentSettings.responseLength}% of a standard detailed response.
        
        CURRENT PRODUCT CATALOG:
        ${productContext}

        CONVERSATION HISTORY:
        ${conversationContext}

        CUSTOMER QUERY: "${customerQuery}"

        TASK: Provide a concise WhatsApp-style response. Use bold text for product names. If they ask about stock, be precise.`,
        config: {
          temperature: temperature,
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
        contents: `Analyze the following customer message and return ONLY one word: "Positive", "Neutral", "Negative", or "Frustrated". Message: "${text}"`,
      });
      return (response.text || "Neutral").trim();
    } catch (error) {
      return "Neutral";
    }
  }
}

export const gemini = new GeminiService();
