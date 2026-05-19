import pool from '../config/db.config';

export class AgentPerformanceService {

    async getAgentPerformance(startDate?: string, endDate?: string) {
        try {
            // Default to last 30 days if not provided
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const end = endDate ? new Date(endDate) : new Date();

            const query = `
                SELECT 
                    u.id as user_id, 
                    u.name, 
                    u.email, 
                    u.role,
                    COUNT(m.id) as total_responses,
                    ROUND(AVG(m.response_time_ms) / 1000.0, 2) as avg_response_time_seconds,
                    ROUND(AVG(m.response_time_ms) / 60000.0, 2) as avg_response_time_minutes,
                    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY m.response_time_ms) / 60000.0 as median_response_time_minutes,
                    MIN(m.response_time_ms) / 60000.0 as min_response_time_minutes,
                    MAX(m.response_time_ms) / 60000.0 as max_response_time_minutes,
                    SUM(CASE WHEN m.response_time_ms > 300000 THEN 1 ELSE 0 END) as sla_breach_count,
                    ROUND((1.0 - (SUM(CASE WHEN m.response_time_ms > 300000 THEN 1 ELSE 0 END)::numeric / COUNT(m.id)::numeric)) * 100, 2) as sla_compliance_rate
                FROM agent_response_metrics m
                JOIN users u ON m.user_id = u.id
                WHERE m.replied_at BETWEEN $1 AND $2
                GROUP BY u.id, u.name, u.email, u.role
                ORDER BY avg_response_time_minutes ASC
            `;

            const result = await pool.query(query, [start, end]);
            return result.rows;
        } catch (error: any) {
            console.error('Error fetching agent performance stats:', error.message);
            throw error;
        }
    }

    async getPerformanceHistory(userId: number, startDate?: string, endDate?: string) {
        try {
            // Default to last 7 days
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
            const end = endDate ? new Date(endDate) : new Date();

            // Aggregated by day
            const query = `
                SELECT 
                    DATE(m.replied_at) as date,
                    COUNT(m.id) as total_responses,
                    ROUND(AVG(m.response_time_ms) / 60000.0, 2) as avg_response_time_minutes
                FROM agent_response_metrics m
                WHERE m.user_id = $1 AND m.replied_at BETWEEN $2 AND $3
                GROUP BY DATE(m.replied_at)
                ORDER BY DATE(m.replied_at) ASC
             `;

            const result = await pool.query(query, [userId, start, end]);
            return result.rows;
        } catch (error: any) {
            console.error('Error fetching agent performance history:', error.message);
            throw error;
        }
    }
}
