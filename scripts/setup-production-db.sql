-- HealthPeDhyan Production Database Setup
-- Run this script on your production PostgreSQL database
-- This script is idempotent (safe to run multiple times)

-- ============================================================================
-- 1. Add video and tags to articles
-- ============================================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;

-- ============================================================================
-- 2. Contact Messages
-- ============================================================================

-- Create enum for contact message status
DO $$ BEGIN
    CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create contact_messages table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_createdAt_idx ON contact_messages("createdAt");
CREATE INDEX IF NOT EXISTS contact_messages_email_idx ON contact_messages(email);

-- ============================================================================
-- 3. Label Scanner
-- ============================================================================

-- Create enum for label scan status
DO $$ BEGIN
    CREATE TYPE "LabelScanStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create label_scans table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS label_scans_status_idx ON label_scans(status);
CREATE INDEX IF NOT EXISTS label_scans_createdAt_idx ON label_scans("createdAt");
CREATE INDEX IF NOT EXISTS label_scans_userId_idx ON label_scans("userId");
CREATE INDEX IF NOT EXISTS label_scans_healthScore_idx ON label_scans("healthScore");

-- ============================================================================
-- 4. OTP Authentication
-- ============================================================================

-- Create login_otps table
CREATE TABLE IF NOT EXISTS login_otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS login_otps_email_idx ON login_otps(email);
CREATE INDEX IF NOT EXISTS login_otps_otp_idx ON login_otps(otp);
CREATE INDEX IF NOT EXISTS login_otps_expiresAt_idx ON login_otps("expiresAt");

-- ============================================================================
-- Clean up expired OTPs (optional - run periodically)
-- ============================================================================

DELETE FROM login_otps WHERE "expiresAt" < NOW() - INTERVAL '1 hour';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check if all tables exist
SELECT
    'articles' as table_name,
    EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'videoUrl') as has_video_url,
    EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'tags') as has_tags
UNION ALL
SELECT
    'contact_messages' as table_name,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_messages') as has_video_url,
    NULL as has_tags
UNION ALL
SELECT
    'label_scans' as table_name,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'label_scans') as has_video_url,
    NULL as has_tags
UNION ALL
SELECT
    'login_otps' as table_name,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'login_otps') as has_video_url,
    NULL as has_tags;

-- Display setup completion message
SELECT '✅ Production database setup completed successfully!' as status;
