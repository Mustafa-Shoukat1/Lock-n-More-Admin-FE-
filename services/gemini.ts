import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Generates a suggested response for a customer query based on conversation history.
   */
  async getAiResponseSuggestion(conversationContext: string, customerQuery: string) {
    try {
      // Always initialize with named parameter and direct process.env.API_KEY access
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the following conversation history:
        ${conversationContext}

        Customer just said: "${customerQuery}"

        Provide a helpful, concise, and sales-oriented response as a WhatsApp AI Sales agent.`,
        config: {
          temperature: 0.7,
        }
      });
      // response.text is a property, not a method
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Error generating suggestion.";
    }
  }

  /**
   * Analyzes the sentiment of a customer message.
   */
  async analyzeSentiment(text: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the sentiment of this customer message and return only one word (Positive, Neutral, or Negative): "${text}"`,
      });
      return (response.text || "Neutral").trim();
    } catch (error) {
      console.error("Gemini Sentiment Error:", error);
      return "Neutral";
    }
  }
}

export const gemini = new GeminiService();