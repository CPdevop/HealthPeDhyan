import nodemailer from 'nodemailer';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

/**
 * Create email transporter
 * Supports both SMTP and Gmail
 */
function createTransporter() {
  // For production, use SMTP credentials from environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For Gmail, use app-specific password
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // For development/testing - log to console only
  console.warn('No email credentials configured. Email will be logged to console only.');
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

/**
 * Send email notification for new contact form submission
 */
export async function sendContactNotification(contactMessage: ContactMessage) {
  const transporter = createTransporter();

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

  const info = await transporter.sendMail(mailOptions);

  // For development transporter, log the message
  if (info.message) {
    console.log('Email would be sent:');
    console.log(info.message.toString());
  } else {
    console.log('Email sent:', info.messageId);
  }

  return info;
}

/**
 * Send confirmation email to the person who submitted the form
 */
export async function sendContactConfirmation(contactMessage: ContactMessage) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'hello@healthpedhyan.com',
    to: contactMessage.email,
    subject: `We received your message: ${contactMessage.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Thank you for contacting HealthPeDhyan™</h2>

        <p>Hi ${contactMessage.name},</p>

        <p>We've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your message:</h3>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${contactMessage.subject}</p>
          <p style="white-space: pre-wrap; margin-top: 10px;">${contactMessage.message}</p>
        </div>

        <p>If you have any urgent concerns, please reply to this email.</p>

        <p>Best regards,<br>The HealthPeDhyan Team</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          HealthPeDhyan™ - Healthy choices made easy
        </p>
      </div>
    `,
    text: `
Thank you for contacting HealthPeDhyan™

Hi ${contactMessage.name},

We've received your message and will get back to you as soon as possible, usually within 24-48 hours.

Your message:
Subject: ${contactMessage.subject}

${contactMessage.message}

If you have any urgent concerns, please reply to this email.

Best regards,
The HealthPeDhyan Team

---
HealthPeDhyan™ - Healthy choices made easy
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (info.message) {
    console.log('Confirmation email would be sent to:', contactMessage.email);
  } else {
    console.log('Confirmation email sent to:', contactMessage.email);
  }

  return info;
}
