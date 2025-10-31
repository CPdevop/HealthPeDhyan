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
