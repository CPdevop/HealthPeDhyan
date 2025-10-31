# HealthPeDhyan™ - Production Deployment Guide

Complete guide to deploy HealthPeDhyan to production.

---

## 📋 Pre-Deployment Checklist

### ✅ Database
- [ ] Production PostgreSQL database created
- [ ] All migration scripts run:
  - `scripts/add-article-video-fields.sql`
  - `scripts/add-contact-messages.sql`
  - `scripts/add-label-scanner.sql`
  - `scripts/add-otp-table.sql`
- [ ] Database credentials secured
- [ ] Database backups configured

### ✅ Environment Variables
- [ ] All production environment variables configured
- [ ] NEXTAUTH_SECRET generated (secure random string)
- [ ] Database URL configured
- [ ] Email/SMTP configured for OTP
- [ ] Production domain configured

### ✅ Email Configuration
- [ ] SMTP credentials configured OR Gmail app password
- [ ] Test OTP emails working
- [ ] Contact form notifications working
- [ ] Email delivery confirmed

### ✅ OCR Setup
- [ ] Tesseract OCR installed on production server
- [ ] Tesseract binary accessible in PATH
- [ ] English language data installed

### ✅ Admin Account
- [ ] Admin user created in production database
- [ ] Admin password secure and documented
- [ ] OTP email (cpmjha@gmail.com) verified

### ✅ Application
- [ ] Production build tested locally
- [ ] All API routes working
- [ ] Image uploads working
- [ ] Label scanner tested
- [ ] Admin panel accessible

---

## 🌍 Deployment Options

### Option 1: Vercel (Recommended - Easiest)
**Pros:** Zero-config deployment, automatic SSL, global CDN
**Cons:** Serverless limits, cold starts

### Option 2: Railway
**Pros:** Full server control, persistent storage, PostgreSQL included
**Cons:** More expensive than Vercel

### Option 3: DigitalOcean App Platform
**Pros:** Good balance, managed services
**Cons:** Requires more configuration

### Option 4: VPS (DigitalOcean Droplet, AWS EC2, etc.)
**Pros:** Full control, most flexible
**Cons:** Manual setup, requires DevOps knowledge

---

## 🚀 Deployment Instructions

### A. Deploy to Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Configure Environment Variables
Create `.env.production` with:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/healthpedhyan?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://healthpedhyan.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email (Gmail)
GMAIL_USER="cpmjha@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# OR SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="cpmjha@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@healthpedhyan.com"

# Public URL
NEXT_PUBLIC_BASE_URL="https://healthpedhyan.com"
```

#### 4. Build and Test Locally
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Build for production
pnpm build

# Test production build
pnpm start
```

#### 5. Deploy to Vercel
```bash
# Deploy
vercel

# Set environment variables in Vercel dashboard:
# https://vercel.com/[your-team]/[project]/settings/environment-variables

# Deploy to production
vercel --prod
```

#### 6. Configure Custom Domain
- Go to Vercel dashboard → Settings → Domains
- Add your domain (healthpedhyan.com)
- Update DNS records as instructed

---

### B. Deploy to Railway

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login and Initialize
```bash
railway login
railway init
```

#### 3. Create PostgreSQL Database
```bash
railway add postgresql
```

#### 4. Set Environment Variables
```bash
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set GMAIL_USER="cpmjha@gmail.com"
railway variables set GMAIL_APP_PASSWORD="your-password"
# ... add all other variables
```

#### 5. Deploy
```bash
railway up
```

#### 6. Install Tesseract
Add to `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Create `nixpacks.toml`:
```toml
[phases.setup]
aptPkgs = ["tesseract-ocr", "tesseract-ocr-eng"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm db:generate", "pnpm build"]

[start]
cmd = "pnpm start"
```

---

### C. Deploy to VPS (Ubuntu 22.04)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Tesseract OCR
sudo apt install -y tesseract-ocr tesseract-ocr-eng

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE healthpedhyan;
CREATE USER healthpedhyan_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE healthpedhyan TO healthpedhyan_user;
\q

# Run migrations
psql -U healthpedhyan_user -d healthpedhyan -f scripts/setup-production-db.sql
```

#### 3. Clone and Build Application
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/Health.git healthpedhyan
cd healthpedhyan

# Install dependencies
pnpm install

# Create .env.production
nano .env.production
# Paste your environment variables

# Generate Prisma client
pnpm db:generate

# Build application
pnpm build
```

#### 4. Setup PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start pnpm --name "healthpedhyan" -- start

# Configure auto-restart
pm2 startup
pm2 save
```

#### 5. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/healthpedhyan
```

Add:
```nginx
server {
    listen 80;
    server_name healthpedhyan.com www.healthpedhyan.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/healthpedhyan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt
```bash
sudo certbot --nginx -d healthpedhyan.com -d www.healthpedhyan.com
```

---

## 🗄️ Database Migration Script

Create `scripts/setup-production-db.sql`:
```sql
-- Run all migrations in order

-- 1. Articles video fields
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;

-- 2. Contact messages
CREATE TYPE IF NOT EXISTS "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

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

CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_createdAt_idx ON contact_messages("createdAt");
CREATE INDEX IF NOT EXISTS contact_messages_email_idx ON contact_messages(email);

-- 3. Label scanner
CREATE TYPE IF NOT EXISTS "LabelScanStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

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

CREATE INDEX IF NOT EXISTS label_scans_status_idx ON label_scans(status);
CREATE INDEX IF NOT EXISTS label_scans_createdAt_idx ON label_scans("createdAt");
CREATE INDEX IF NOT EXISTS label_scans_userId_idx ON label_scans("userId");
CREATE INDEX IF NOT EXISTS label_scans_healthScore_idx ON label_scans("healthScore");

-- 4. OTP authentication
CREATE TABLE IF NOT EXISTS login_otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS login_otps_email_idx ON login_otps(email);
CREATE INDEX IF NOT EXISTS login_otps_otp_idx ON login_otps(otp);
CREATE INDEX IF NOT EXISTS login_otps_expiresAt_idx ON login_otps("expiresAt");
```

---

## 🔐 Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database uses SSL connection
- [ ] Admin password is strong and secure
- [ ] SMTP credentials secured
- [ ] Environment variables not committed to git
- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] Rate limiting configured (if applicable)
- [ ] File upload restrictions in place
- [ ] Database backups configured

---

## 📧 Email Setup Guide

### Gmail App Password Setup:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Add to environment variables:
   ```
   GMAIL_USER=cpmjha@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```

---

## 🧪 Production Testing Checklist

After deployment, test:

- [ ] Homepage loads correctly
- [ ] Admin login works (with OTP)
- [ ] Can create/edit articles
- [ ] Can create/edit products
- [ ] Blog pages load
- [ ] Shop pages load
- [ ] Contact form works
- [ ] Label scanner works
- [ ] Image uploads work
- [ ] Email notifications work
- [ ] OTP emails received
- [ ] Mobile responsive
- [ ] SSL certificate valid

---

## 🆘 Troubleshooting

### Issue: OTP emails not sending
**Solution:** Check SMTP credentials, test email delivery, check spam folder

### Issue: Label scanner not working
**Solution:** Ensure Tesseract is installed: `tesseract --version`

### Issue: Database connection failed
**Solution:** Check DATABASE_URL, ensure SSL mode is correct, verify database is accessible

### Issue: Build fails
**Solution:** Run `pnpm db:generate` before `pnpm build`

### Issue: Images not uploading
**Solution:** Check `public/uploads` directory permissions, ensure writable

---

## 📊 Monitoring

### Recommended Tools:
- **Uptime:** UptimeRobot (free)
- **Analytics:** Google Analytics or Plausible
- **Error Tracking:** Sentry
- **Logs:** Papertrail or Logtail

---

## 🔄 Maintenance

### Daily:
- Check error logs
- Monitor OTP email delivery

### Weekly:
- Review contact form submissions
- Check label scan statistics
- Database backup verification

### Monthly:
- Update dependencies: `pnpm update`
- Security audit
- Performance review

---

## 📞 Support

If you need help:
1. Check error logs
2. Review this guide
3. Check Next.js documentation
4. Check Prisma documentation

---

**Good luck with your production deployment!** 🚀

HealthPeDhyan™ - Trusted Health Product Discovery
