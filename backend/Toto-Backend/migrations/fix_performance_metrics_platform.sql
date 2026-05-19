-- Expand performance metrics platform constraint to include TikTok.
ALTER TABLE agent_response_metrics
DROP CONSTRAINT IF EXISTS agent_response_metrics_platform_check;

ALTER TABLE agent_response_metrics
ADD CONSTRAINT agent_response_metrics_platform_check
CHECK (platform IN ('whatsapp', 'instagram', 'tiktok'));