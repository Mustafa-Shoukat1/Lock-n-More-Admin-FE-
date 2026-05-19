
import { db } from "./db";
import { AiSettings, Platform } from "../types";
import { api } from './api';

export class GeminiService {
  /**
   * Generates a suggested response with full context of the product catalog.
   */
  async getAiResponseSuggestion(conversationContext: string, customerQuery: string, settings?: AiSettings) {
    try {
      const session = api.getStoredSession();
      const currentSettings = settings || db.load().aiSettings;

      if (!session?.token) {
        return this.buildFallbackSuggestion(conversationContext, customerQuery, currentSettings);
      }

      return await api.suggestAiResponse(session.token, conversationContext, customerQuery, currentSettings);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      return "I'm having trouble generating a response right now.";
    }
  }

  async analyzeSentiment(text: string) {
    try {
      const session = api.getStoredSession();
      if (!session?.token) {
        return this.buildFallbackSentiment(text);
      }

      return await api.analyzeSentiment(session.token, text);
    } catch (error) {
      return this.buildFallbackSentiment(text);
    }
  }

  private buildFallbackSuggestion(conversationContext: string, customerQuery: string, settings: AiSettings) {
    const tone = settings.tone || 'helpful';
    const opening = tone === 'professional' ? 'Thanks for reaching out.' : 'Absolutely.';
    const channel = conversationContext.toLowerCase().includes('whatsapp') ? 'WhatsApp' : 'the conversation';
    return `${opening} ${customerQuery} I can help with that. Based on ${channel}, here is a quick reply draft.`;
  }

  private buildFallbackSentiment(text: string) {
    const lower = text.toLowerCase();
    if (/angry|bad|hate|upset|frustrated|late|delay|issue|problem/.test(lower)) return 'Frustrated';
    if (/thanks|great|perfect|good|nice|love|awesome/.test(lower)) return 'Positive';
    if (/price|how much|stock|available|details|info/.test(lower)) return 'Neutral';
    return 'Neutral';
  }
}

export const gemini = new GeminiService();
