-- Complete database setup for Windows
-- This script creates all tables and adds missing columns

-- 1. Add missing columns to articles table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;
    END IF;
END $$;

-- 2. Create ContactMessageStatus enum if not exists
DO $$ BEGIN
    CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create contact_messages table if not exists
CREATE TABLE IF NOT EXISTS contact_messages (
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

-- 4. Create indexes for contact_messages
CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" ON contact_messages(status);
CREATE INDEX IF NOT EXISTS "contact_messages_createdAt_idx" ON contact_messages("createdAt");
CREATE INDEX IF NOT EXISTS "contact_messages_email_idx" ON contact_messages(email);

-- 5. Create LabelScanStatus enum if not exists
DO $$ BEGIN
    CREATE TYPE "LabelScanStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Create label_scans table if not exists
CREATE TABLE IF NOT EXISTS label_scans (
    id TEXT PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "ocrText" TEXT,
    "extractedData" JSONB,
    "healthScore" INTEGER,
    "analysisResult" JSONB,
    status "LabelScanStatus" NOT NULL DEFAULT 'PROCESSING',
    "userId" TEXT,
    "productName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create indexes for label_scans
CREATE INDEX IF NOT EXISTS "label_scans_status_idx" ON label_scans(status);
CREATE INDEX IF NOT EXISTS "label_scans_createdAt_idx" ON label_scans("createdAt");
CREATE INDEX IF NOT EXISTS "label_scans_userId_idx" ON label_scans("userId");
CREATE INDEX IF NOT EXISTS "label_scans_healthScore_idx" ON label_scans("healthScore");

-- Done
SELECT 'Database setup complete!' as message;
