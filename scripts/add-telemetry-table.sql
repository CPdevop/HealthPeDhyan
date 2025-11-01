-- Add Telemetry Events Table
-- Run with: psql -U postgres -d healthpedhyan -f scripts/add-telemetry-table.sql

-- Create enum for telemetry event types
DO $$ BEGIN
    CREATE TYPE "TelemetryEventType" AS ENUM (
        'PAGE_VIEW',
        'USER_ACTION',
        'API_CALL',
        'ERROR',
        'PERFORMANCE',
        'FEATURE_USAGE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create telemetry_events table
CREATE TABLE IF NOT EXISTS telemetry_events (
    id TEXT PRIMARY KEY,
    "eventType" "TelemetryEventType" NOT NULL,
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    path TEXT,
    referrer TEXT,
    properties JSONB,
    duration INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS telemetry_events_eventType_idx ON telemetry_events("eventType");
CREATE INDEX IF NOT EXISTS telemetry_events_eventName_idx ON telemetry_events("eventName");
CREATE INDEX IF NOT EXISTS telemetry_events_userId_idx ON telemetry_events("userId");
CREATE INDEX IF NOT EXISTS telemetry_events_sessionId_idx ON telemetry_events("sessionId");
CREATE INDEX IF NOT EXISTS telemetry_events_createdAt_idx ON telemetry_events("createdAt");
CREATE INDEX IF NOT EXISTS telemetry_events_path_idx ON telemetry_events(path);

-- Optional: Create a view for common analytics queries
CREATE OR REPLACE VIEW telemetry_summary AS
SELECT
    DATE("createdAt") as date,
    "eventType",
    "eventName",
    COUNT(*) as event_count,
    COUNT(DISTINCT "userId") as unique_users,
    COUNT(DISTINCT "sessionId") as unique_sessions
FROM telemetry_events
GROUP BY DATE("createdAt"), "eventType", "eventName"
ORDER BY date DESC, event_count DESC;

-- Success message
SELECT '✅ Telemetry table created successfully!' as status;
