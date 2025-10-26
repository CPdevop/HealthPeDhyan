-- Add videoUrl and tags columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;
