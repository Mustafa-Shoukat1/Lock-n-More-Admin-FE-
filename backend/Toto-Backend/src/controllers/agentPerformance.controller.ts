import { Request, Response } from 'express';
import { AgentPerformanceService } from '../services/agentPerformance.service';

const agentPerformanceService = new AgentPerformanceService();

export class AgentPerformanceController {

    async getAgentPerformance(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            const stats = await agentPerformanceService.getAgentPerformance(startDate as string, endDate as string);
            res.status(200).json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAgentHistory(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const history = await agentPerformanceService.getPerformanceHistory(Number(userId), startDate as string, endDate as string);
            res.status(200).json(history);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
