-- Create LabelScanStatus enum
CREATE TYPE "LabelScanStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- Create label_scans table
CREATE TABLE label_scans (
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
CREATE INDEX "label_scans_status_idx" ON label_scans(status);
CREATE INDEX "label_scans_createdAt_idx" ON label_scans("createdAt");
CREATE INDEX "label_scans_userId_idx" ON label_scans("userId");
CREATE INDEX "label_scans_healthScore_idx" ON label_scans("healthScore");

-- Grant permissions to healthpedhyan user
GRANT ALL PRIVILEGES ON TABLE label_scans TO healthpedhyan;
