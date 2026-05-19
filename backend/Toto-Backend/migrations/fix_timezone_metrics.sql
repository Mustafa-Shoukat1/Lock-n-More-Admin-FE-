-- Migration to fix response time calculation by using TIMESTAMPTZ
-- This ensures that UTC timestamps are correctly interpreted regardless of server timezone.

-- 1. Update whatsapp_sessions
ALTER TABLE whatsapp_sessions 
ALTER COLUMN last_customer_message_at TYPE TIMESTAMPTZ USING last_customer_message_at AT TIME ZONE 'UTC';

-- 2. Update agent_response_metrics
ALTER TABLE agent_response_metrics
ALTER COLUMN inbound_at TYPE TIMESTAMPTZ USING inbound_at AT TIME ZONE 'UTC',
ALTER COLUMN replied_at TYPE TIMESTAMPTZ USING replied_at AT TIME ZONE 'UTC',
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- 3. Optional: Recalculate response_time_ms for existing records that are clearly incorrect
-- If response_time_ms is > 5 hours, it's likely affected by the offset.
UPDATE agent_response_metrics
SET response_time_ms = response_time_ms - 18000000
WHERE response_time_ms >= 18000000;
