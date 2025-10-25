-- Create ContactMessageStatus enum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- Create contact_messages table
CREATE TABLE contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "contact_messages_status_idx" ON contact_messages(status);
CREATE INDEX "contact_messages_createdAt_idx" ON contact_messages("createdAt");
CREATE INDEX "contact_messages_email_idx" ON contact_messages(email);

-- Grant permissions to healthpedhyan user
GRANT ALL PRIVILEGES ON TABLE contact_messages TO healthpedhyan;
