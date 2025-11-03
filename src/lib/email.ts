interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Check if email is configured
 */
function isEmailConfigured(): boolean {
  return !!(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  );
}

/**
 * Generic email sending function
 * Used for OTP, notifications, etc.
 */
export async function sendEmail(options: EmailOptions) {
  // If no email is configured, just log to console
  if (!isEmailConfigured()) {
    console.log('\n📧 EMAIL (not sent - no SMTP configured):');
    console.log('━'.repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('━'.repeat(60));
    console.log(`Text:\n${options.text}`);
    console.log('━'.repeat(60));
    return { logged: true };
  }

  // Dynamically import nodemailer only when configured
  const nodemailer = await import('nodemailer');

  let transporter;

  // For production, use SMTP credentials from environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // For Gmail, use app-specific password
    transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  if (!transporter) {
    console.warn('Email transporter could not be created');
    return { error: 'Email not configured' };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@healthpedhyan.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

/**
 * Send email notification for new contact form submission
 * If email is not configured, logs to console instead
 */
export async function sendContactNotification(contactMessage: ContactMessage) {
  // If no email is configured, just log to console
  if (!isEmailConfigured()) {
    console.log('\n📧 NEW CONTACT FORM SUBMISSION:');
    console.log('━'.repeat(60));
    console.log(`From: ${contactMessage.name} <${contactMessage.email}>`);
    console.log(`Subject: ${contactMessage.subject}`);
    console.log(`Date: ${contactMessage.createdAt.toLocaleString()}`);
    console.log('━'.repeat(60));
    console.log(`Message:\n${contactMessage.message}`);
    console.log('━'.repeat(60));
    console.log(`Reply to: ${contactMessage.email}\n`);
    return { logged: true };
  }

  // Dynamically import nodemailer only when configured
  const nodemailer = await import('nodemailer');

  let transporter;

  // For production, use SMTP credentials from environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // For Gmail, use app-specific password
    transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  if (!transporter) {
    console.warn('Email transporter could not be created');
    return { error: 'Email not configured' };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@healthpedhyan.com',
    to: 'hello@healthpedhyan.com',
    subject: `New Contact Form Submission: ${contactMessage.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Contact Form Submission</h2>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${contactMessage.name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${contactMessage.email}">${contactMessage.email}</a></p>
          <p style="margin: 10px 0;"><strong>Subject:</strong> ${contactMessage.subject}</p>
          <p style="margin: 10px 0;"><strong>Submitted:</strong> ${contactMessage.createdAt.toLocaleString()}</p>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${contactMessage.message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Reply to:</strong> <a href="mailto:${contactMessage.email}?subject=Re: ${encodeURIComponent(contactMessage.subject)}">${contactMessage.email}</a>
          </p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          This is an automated notification from HealthPeDhyan™ contact form.
        </p>
      </div>
    `,
    text: `
New Contact Form Submission

Name: ${contactMessage.name}
Email: ${contactMessage.email}
Subject: ${contactMessage.subject}
Submitted: ${contactMessage.createdAt.toLocaleString()}

Message:
${contactMessage.message}

---
Reply to: ${contactMessage.email}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
}

/**
 * Send confirmation email to the person who submitted the form
 * This is optional - currently disabled by default
 */
export async function sendContactConfirmation(contactMessage: ContactMessage) {
  // Skip confirmation emails for now
  console.log(`Confirmation email skipped for: ${contactMessage.email}`);
  return { skipped: true };
}

/**
 * Send email verification link to new users
 */
export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Verify your HealthPeDhyan account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HealthPeDhyan!</h1>
        </div>

        <div style="padding: 40px 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${name},
          </p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining HealthPeDhyan! We're excited to help you make healthier choices.
          </p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 30px;">
            Please verify your email address to activate your account and start exploring healthy products:
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}"
               style="background-color: #059669; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
            ${verificationUrl}
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              <strong>What's next?</strong>
            </p>
            <ul style="font-size: 14px; color: #6b7280; line-height: 1.8;">
              <li>Complete your health profile</li>
              <li>Set your dietary preferences</li>
              <li>Bookmark your favorite products</li>
              <li>Get personalized recommendations</li>
            </ul>
          </div>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 10px;">
            © ${new Date().getFullYear()} HealthPeDhyan. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
Welcome to HealthPeDhyan!

Hi ${name},

Thank you for joining HealthPeDhyan! We're excited to help you make healthier choices.

Please verify your email address to activate your account:
${verificationUrl}

This link will expire in 24 hours.

What's next?
- Complete your health profile
- Set your dietary preferences
- Bookmark your favorite products
- Get personalized recommendations

If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} HealthPeDhyan. All rights reserved.
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Reset your HealthPeDhyan password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>

        <div style="padding: 40px 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${name},
          </p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your HealthPeDhyan account.
          </p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 30px;">
            Click the button below to create a new password:
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}"
               style="background-color: #059669; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
            ${resetUrl}
          </p>

          <div style="margin-top: 40px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 10px;">
            © ${new Date().getFullYear()} HealthPeDhyan. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
Password Reset Request

Hi ${name},

We received a request to reset your password for your HealthPeDhyan account.

Click this link to create a new password:
${resetUrl}

This link will expire in 1 hour for security reasons.

⚠️ Security Notice: If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} HealthPeDhyan. All rights reserved.
    `,
  });
}
