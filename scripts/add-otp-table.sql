-- Add OTP authentication table
-- Run with: psql -U postgres -d healthpedhyan -f scripts/add-otp-table.sql

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

-- Clean up expired OTPs older than 1 hour
DELETE FROM login_otps WHERE "expiresAt" < NOW() - INTERVAL '1 hour';
