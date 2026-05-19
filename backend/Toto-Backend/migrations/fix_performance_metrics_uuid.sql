-- Change session_id from INTEGER to VARCHAR to support UUIDs (WhatsApp)
ALTER TABLE agent_response_metrics
ALTER COLUMN session_id TYPE VARCHAR USING session_id::VARCHAR;
