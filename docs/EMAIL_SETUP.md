# Email Configuration for Contact Form

The contact form sends email notifications to `hello@healthpedhyan.com` when someone submits a message.

## Setup Options

### Option 1: Gmail (Easiest for Development)

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Step Verification if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password for "Mail"
5. Copy the 16-character password
6. Add to `.env`:

```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"  # 16-character app password
```

### Option 2: SMTP Server (Production)

For production, use a dedicated email service like SendGrid, Mailgun, or AWS SES:

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="HealthPeDhyan <noreply@healthpedhyan.com>"
```

## Development Mode

If no email credentials are configured, emails will be logged to the console instead of being sent. This is useful for testing.

## Testing

1. Configure email credentials in `.env`
2. Start the dev server: `pnpm dev`
3. Visit http://localhost:3000/contact
4. Fill out and submit the form
5. Check that:
   - Email is sent to `hello@healthpedhyan.com`
   - Message appears in admin panel at http://localhost:3000/admin/contact-messages

## Email Features

The system sends:
- **Admin notification**: Sent to `hello@healthpedhyan.com` with the full message
- **Auto-confirmation**: Optionally send confirmation to the person who submitted (currently disabled, can be enabled in `/api/contact/route.ts`)

## Troubleshooting

### Gmail "Less secure app" error
- Use an App Password instead of your regular password
- Never use your main Google account password

### SMTP connection errors
- Check firewall settings
- Verify SMTP host and port
- Ensure TLS/SSL settings match your provider

### Emails going to spam
- Configure SPF, DKIM, and DMARC records for your domain
- Use a verified "From" address
- Consider using a dedicated email service
