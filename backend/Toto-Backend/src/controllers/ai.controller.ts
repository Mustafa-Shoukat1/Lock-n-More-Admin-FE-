import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export class AIController {
    async suggest(req: Request, res: Response) {
        try {
            const { conversationContext, customerQuery, settings } = req.body || {};

            if (!conversationContext || !customerQuery) {
                return res.status(400).json({ error: 'conversationContext and customerQuery are required' });
            }

            const suggestion = await aiService.getResponseSuggestion(conversationContext, customerQuery, settings);
            res.status(200).json({ suggestion });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sentiment(req: Request, res: Response) {
        try {
            const { text } = req.body || {};

            if (!text) {
                return res.status(400).json({ error: 'text is required' });
            }

            const sentiment = await aiService.analyzeSentiment(text);
            res.status(200).json({ sentiment });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}