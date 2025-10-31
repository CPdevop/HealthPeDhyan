# 🚀 Quick Start - Production Deployment

Fast track guide to get HealthPeDhyan live in production.

---

## 📝 Step-by-Step Checklist

### Step 1: Choose Your Deployment Platform

Pick one:
- ☑️ **Vercel** (Easiest - recommended for first deployment)
- ☑️ **Railway** (Good for full control + built-in PostgreSQL)
- ☑️ **VPS** (Most control, requires setup)

---

### Step 2: Set Up Production Database

#### Option A: Managed PostgreSQL (Easiest)
- Create PostgreSQL database on:
  - Railway: Built-in
  - Supabase: Free tier available
  - Neon: Serverless PostgreSQL
  - AWS RDS / DigitalOcean Database

#### Option B: Self-Hosted
```bash
# Install PostgreSQL
sudo apt install postgresql

# Create database
sudo -u postgres createdb healthpedhyan
sudo -u postgres createuser healthpedhyan_user
```

#### Run Migrations
```bash
# Connect to your production database
psql -U healthpedhyan_user -d healthpedhyan -h your-host.com

# Run setup script
\i scripts/setup-production-db.sql
```

---

### Step 3: Configure Environment Variables

1. Copy `.env.production.example` to `.env.production`
2. Fill in all values:

**Required:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.com"
GMAIL_USER="cpmjha@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification
3. Create new app password
4. Copy 16-character password

---

### Step 4: Test Build Locally

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

✅ Visit http://localhost:3000 - everything should work!

---

### Step 5: Deploy

#### 🟢 Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then deploy to production:
vercel --prod
```

**In Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Add all variables from `.env.production`
3. Redeploy

#### 🟣 Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set GMAIL_USER="cpmjha@gmail.com"
# ... add all variables

# Deploy
railway up
```

---

### Step 6: Install Tesseract OCR

**Vercel:** Add to `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@18"
    }
  }
}
```
Note: Tesseract may not work on Vercel serverless. Consider Railway or VPS.

**Railway:** Add `nixpacks.toml`:
```toml
[phases.setup]
aptPkgs = ["tesseract-ocr", "tesseract-ocr-eng"]
```

**VPS:**
```bash
sudo apt install tesseract-ocr tesseract-ocr-eng
```

---

### Step 7: Create Admin Account

```bash
# Run on production database
psql -U healthpedhyan_user -d healthpedhyan -h your-host.com
```

```sql
-- Create admin user
INSERT INTO users (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin_' || substring(md5(random()::text) from 1 for 10),
  'admin@healthpedhyan.com',
  'Admin',
  '$2a$10$your_bcrypt_hash_here',  -- Generate with bcryptjs
  'ADMIN',
  NOW(),
  NOW()
);
```

**Generate password hash:**
```javascript
// Run in Node.js:
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('YourSecurePassword123!', 10));
```

---

### Step 8: Configure Domain

#### Vercel:
1. Go to Settings → Domains
2. Add `healthpedhyan.com`
3. Update DNS records (A or CNAME)
4. Wait for SSL certificate (automatic)

#### Railway:
1. Go to Settings → Networking
2. Add custom domain
3. Update DNS with provided CNAME
4. SSL is automatic

#### VPS:
```bash
# Install Nginx & Certbot
sudo apt install nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/healthpedhyan
# Add proxy configuration (see PRODUCTION_DEPLOYMENT.md)

# Enable site
sudo ln -s /etc/nginx/sites-available/healthpedhyan /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d healthpedhyan.com
```

---

### Step 9: Test Everything

Visit your production site and test:

- [ ] Homepage loads
- [ ] Can login to admin (with OTP)
- [ ] OTP email received at cpmjha@gmail.com
- [ ] Can create article
- [ ] Can create product
- [ ] Blog works
- [ ] Shop works
- [ ] Contact form works
- [ ] Contact email received
- [ ] Label scanner works
- [ ] HTTPS/SSL working
- [ ] Mobile responsive

---

### Step 10: Monitor & Maintain

**Set up monitoring:**
- Uptime: https://uptimerobot.com
- Errors: https://sentry.io
- Analytics: Google Analytics or Plausible

**Regular maintenance:**
```bash
# Weekly: Check logs
railway logs  # or vercel logs

# Monthly: Update dependencies
pnpm update
pnpm build
# Redeploy
```

---

## 🆘 Common Issues

### OTP emails not arriving
- Check SMTP credentials
- Verify Gmail app password
- Check spam folder
- Test with: `pnpm tsx scripts/test-email.ts`

### Label scanner not working
- Tesseract not installed
- Use Railway or VPS (not Vercel)
- Check: `tesseract --version`

### Database connection failed
- Verify DATABASE_URL
- Check SSL mode: `?sslmode=require`
- Test connection: `psql $DATABASE_URL`

### Build fails
- Run `pnpm db:generate` first
- Check all environment variables
- Clear `.next` folder

---

## 📞 Need Help?

1. Check error logs in your platform dashboard
2. Review `PRODUCTION_DEPLOYMENT.md` for detailed guide
3. Check platform documentation
4. Verify all environment variables are set

---

## ✅ You're Live!

Congratulations! HealthPeDhyan™ is now live in production! 🎉

**Next steps:**
- Monitor error logs daily
- Set up automated backups
- Configure CDN for images
- Set up staging environment
- Document any custom configurations

---

**HealthPeDhyan™** - Trusted Health Product Discovery
