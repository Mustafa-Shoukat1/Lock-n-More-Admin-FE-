-- Update inbound and outbound message IDs to support UUIDs (WhatsApp)
ALTER TABLE agent_response_metrics
ALTER COLUMN inbound_message_id TYPE VARCHAR USING inbound_message_id::VARCHAR,
ALTER COLUMN outbound_message_id TYPE VARCHAR USING outbound_message_id::VARCHAR;
