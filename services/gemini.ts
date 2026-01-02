
import { GoogleGenAI } from "@google/genai";
import { db } from "./db";
import { AiSettings } from "../types";

export class GeminiService {
  private getApiKey(): string {
    // In Vite, process.env.API_KEY is defined via the vite.config.ts define block
    // or through the environment.
    return process.env.API_KEY || "";
  }

  /**
   * Generates a suggested response with full context of the product catalog.
   */
  async getAiResponseSuggestion(conversationContext: string, customerQuery: string, settings?: AiSettings) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Check your environment variables.");
      return "The AI reasoning node is currently offline. Please configure the API key in Vercel settings.";
    }

    try {
      const data = db.load();
      const currentSettings = settings || data.aiSettings;
      const productContext = data.products.map(p => `- ${p.name}: RM${p.price} (${p.stock > 0 ? 'In Stock' : 'Out of Stock'}, SKU: ${p.sku})`).join('\n');
      
      const ai = new GoogleGenAI({ apiKey });
      
      const isSocial = conversationContext.toLowerCase().includes('instagram') || conversationContext.toLowerCase().includes('tiktok');
      const isTiktok = conversationContext.toLowerCase().includes('tiktok');
      
      const platformInstructions = isTiktok 
        ? "PLATFORM: TikTok. TONE: High energy, use 2-3 emojis, very concise. Avoid formal greetings." 
        : isSocial 
          ? "PLATFORM: Instagram. TONE: Visual and friendly. Use 1-2 emojis. Direct and helpful."
          : "PLATFORM: WhatsApp. TONE: Professional, efficient, use bullet points for specs.";

      const temperature = (currentSettings.creativity / 100) * 1.1 + 0.1;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
        SYSTEM ROLE: You are TOTO AI for 'Locks 'N More', a premium smart lock retailer.
        PERSONALITY ARCHETYPE: ${currentSettings.personality}
        CORE TONE: ${currentSettings.tone}
        ${platformInstructions}
        LENGTH CONSTRAINT: Keep it roughly ${currentSettings.responseLength}% of a standard response.
        
        CATALOG DATA:
        ${productContext}

        CONTEXT:
        ${conversationContext}

        CUSTOMER SIGNAL: "${customerQuery}"

        TASK: Synthesize a response. Use **bold** for product names and prices. If they ask about stock, use the catalog data provided above.`,
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
    const apiKey = this.getApiKey();
    if (!apiKey) return "Neutral";

    try {
      const ai = new GoogleGenAI({ apiKey });
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
