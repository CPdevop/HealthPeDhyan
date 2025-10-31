import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and send OTP to user's email
 */
export async function createAndSendOTP(email: string): Promise<void> {
  // Generate OTP
  const otp = generateOTP();

  // Set expiry to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Delete any existing unverified OTPs for this email
  await prisma.loginOtp.deleteMany({
    where: {
      email,
      verified: false,
    },
  });

  // Store OTP in database
  await prisma.loginOtp.create({
    data: {
      id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      otp,
      expiresAt,
      verified: false,
    },
  });

  // Send OTP via email to cpmjha@gmail.com (admin email)
  const adminEmail = 'cpmjha@gmail.com';

  await sendEmail({
    to: adminEmail,
    subject: 'HealthPeDhyan Admin Login - OTP Verification',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9fafb;
              border-radius: 12px;
              padding: 40px;
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 20px;
            }
            .otp-box {
              background: white;
              border: 2px solid #059669;
              border-radius: 8px;
              padding: 30px;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 48px;
              font-weight: bold;
              color: #059669;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin-top: 30px;
              text-align: left;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🏥 HealthPeDhyan</div>

            <h1 style="color: #111827; margin-bottom: 10px;">Admin Login Verification</h1>
            <p style="color: #6b7280; margin-bottom: 30px;">
              Someone attempted to login to the admin panel. Use the code below to complete the login.
            </p>

            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your One-Time Password</p>
              <div class="otp-code">${otp}</div>
            </div>

            <p style="color: #374151;">
              This code will expire in <strong>10 minutes</strong>.
            </p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              Never share this code with anyone. HealthPeDhyan staff will never ask for your OTP.
              If you didn't attempt to login, please ignore this email and ensure your password is secure.
            </div>

            <div class="footer">
              <p>
                This email was sent to ${adminEmail} because a login attempt was made<br>
                for the HealthPeDhyan admin panel.
              </p>
              <p style="margin-top: 20px;">
                <strong>HealthPeDhyan™</strong> - Trusted Health Product Discovery
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
HealthPeDhyan Admin Login - OTP Verification

Your One-Time Password: ${otp}

This code will expire in 10 minutes.

If you didn't attempt to login, please ignore this email.

HealthPeDhyan™ - Trusted Health Product Discovery
    `,
  });

  console.log(`✅ OTP sent to ${adminEmail} for user: ${email}`);
}

/**
 * Verify OTP for a given email
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  // Find valid OTP
  const otpRecord = await prisma.loginOtp.findFirst({
    where: {
      email,
      otp,
      verified: false,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
  });

  if (!otpRecord) {
    console.log(`❌ Invalid or expired OTP for ${email}`);
    return false;
  }

  // Mark as verified
  await prisma.loginOtp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  console.log(`✅ OTP verified successfully for ${email}`);
  return true;
}

/**
 * Clean up expired OTPs (run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  const result = await prisma.loginOtp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  console.log(`🧹 Cleaned up ${result.count} expired OTPs`);
}
