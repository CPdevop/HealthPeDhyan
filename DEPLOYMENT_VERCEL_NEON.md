# HealthPeDhyan - Vercel + Neon Deployment Guide

Complete guide to deploy HealthPeDhyan to Vercel (frontend/app) with Neon (PostgreSQL database).

## Overview

- **Frontend/App**: Deployed on Vercel
- **Database**: PostgreSQL on Neon (serverless)
- **Deployment Time**: ~10-15 minutes

## Prerequisites

- GitHub/GitLab/Bitbucket account with your repository
- Vercel account (sign up at https://vercel.com)
- Neon account (sign up at https://neon.tech)

---

## Step 1: Set Up Neon Database (5 minutes)

### 1.1 Create Neon Project

1. Go to https://console.neon.tech
2. Click **"New Project"**
3. Configure:
   - **Project name**: `healthpedhyan` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., `US East (Ohio)` or `Asia Pacific (Mumbai)`)
   - **PostgreSQL version**: 16 (latest)
4. Click **"Create Project"**

### 1.2 Get Database Connection String

1. In your Neon project dashboard, click **"Connection Details"**
2. Select **"Pooled connection"** (recommended for serverless)
3. Copy the connection string - it looks like:
   ```
   postgresql://username:password@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save this securely** - you'll need it for Vercel

### 1.3 Configure Database (Optional)

For better performance:
1. Go to **Settings** > **Compute**
2. Set autoscaling: Min 0.25 vCPU, Max 1 vCPU (free tier)
3. Enable **"Auto-suspend"** after 5 minutes of inactivity

---

## Step 2: Deploy to Vercel (5 minutes)

### 2.1 Import Your Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** > **"Project"**
3. Import your GitHub repository
4. Select the repository: `your-username/HealthPeDhyan`

### 2.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`
- **Install Command**: `pnpm install --frozen-lockfile`
- **Output Directory**: `.next` (default)

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables:

```bash
# Database (from Neon Step 1.2)
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here

# NextAuth URL (will update after first deploy)
NEXTAUTH_URL=https://your-app.vercel.app

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=HealthPeDhyan
NODE_ENV=production
```

#### Optional Variables:

```bash
# Admin User (for database seeding)
ADMIN_EMAIL=admin@healthpedhyan.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=Admin User

# Affiliate Links (if applicable)
AFFILIATE_AMAZON_TAG=your-amazon-tag
AFFILIATE_FLIPKART_PARAM=your-flipkart-affid

# Email (Gmail for OTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Analytics (if applicable)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How to generate NEXTAUTH_SECRET:**

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll get a deployment URL like: `https://your-app.vercel.app`

---

## Step 3: Run Database Migrations

The migrations will run automatically during build (configured in `vercel.json`).

To verify:
1. Go to Vercel Dashboard > Your Project > Deployments
2. Click on your latest deployment
3. Check **"Build Logs"** - you should see:
   ```
   ✓ Prisma generate completed
   ✓ Prisma migrate deploy completed
   ✓ Next.js build completed
   ```

### Manual Migration (if needed)

If migrations didn't run automatically:

```bash
# Install Vercel CLI
pnpm install -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
pnpm prisma migrate deploy
```

---

## Step 4: Seed Database (Optional)

To add initial data (admin user, sample products):

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
pnpm db:seed

# Option 2: Using Neon SQL Editor
# 1. Go to Neon Dashboard > SQL Editor
# 2. Copy contents from prisma/seed.ts and run manually
```

---

## Step 5: Update Environment Variables

After first deployment, update the URLs:

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update:
   - `NEXTAUTH_URL` → `https://your-actual-domain.vercel.app`
   - `NEXT_PUBLIC_APP_URL` → `https://your-actual-domain.vercel.app`
3. Redeploy (automatic on next git push)

---

## Step 6: Verify Deployment

### Test the Application:

1. **Homepage**: https://your-app.vercel.app
2. **Health Check**: https://your-app.vercel.app/api/health
3. **Auth Providers**: https://your-app.vercel.app/api/auth/providers

### Test API Endpoints:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Get products (if seeded)
curl https://your-app.vercel.app/api/products
```

### Login (if seeded):

1. Go to: https://your-app.vercel.app/login
2. Use admin credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`

---

## Step 7: Configure for Mobile App

Your backend is now live! Update your mobile app configuration:

### mobile/src/services/api.ts

```typescript
const API_BASE_URL = 'https://your-app.vercel.app/api';
```

### Available Endpoints:

```
GET    /api/health              - Health check
POST   /api/auth/signin         - User login
POST   /api/auth/signup         - User registration
GET    /api/auth/session        - Get current session
POST   /api/auth/signout        - User logout
GET    /api/products            - List products
GET    /api/products/:id        - Get product details
POST   /api/products            - Create product (admin)
POST   /api/scan                - Scan product barcode
GET    /api/articles            - List articles
```

---

## Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Specific deployment
vercel logs <deployment-url>
```

### Monitor Database

1. Go to Neon Dashboard
2. Click **"Monitoring"** to see:
   - Active connections
   - Query performance
   - Storage usage

### Check Performance

1. Vercel Dashboard > Analytics
2. Monitor:
   - Response times
   - Error rates
   - Traffic patterns

---

## Automatic Deployments

Vercel automatically deploys on git push:

```bash
# Push to main branch
git add .
git commit -m "feat: Add new feature"
git push origin main

# Vercel will automatically:
# 1. Pull latest code
# 2. Run build (with migrations)
# 3. Deploy to production
```

### Preview Deployments

Every branch and PR gets a preview URL:

```bash
# Create feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Vercel creates preview: https://your-app-git-feature-new-feature.vercel.app
```

---

## Custom Domain (Optional)

### Add Custom Domain:

1. Vercel Dashboard > Your Project > Settings > Domains
2. Click **"Add Domain"**
3. Enter your domain: `healthpedhyan.com`
4. Follow DNS configuration instructions
5. Update environment variables:
   ```
   NEXTAUTH_URL=https://healthpedhyan.com
   NEXT_PUBLIC_APP_URL=https://healthpedhyan.com
   ```

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Vercel Dashboard > Deployments > Click failed deployment
2. Check error messages

**Common issues:**
- Missing environment variables → Add in Vercel Dashboard
- Prisma migration fails → Check DATABASE_URL is correct
- TypeScript errors → Run `pnpm typecheck` locally first

### Database Connection Issues

**SSL/TLS errors:**
```bash
# Add to DATABASE_URL:
?sslmode=require
```

**Timeout errors:**
```bash
# Add to DATABASE_URL:
?connect_timeout=10&pool_timeout=10
```

**Connection pool exhausted:**
1. Use Neon's **pooled connection string** (not direct)
2. Increase Neon compute limits

### Runtime Errors

**Check function logs:**
```bash
vercel logs --follow
```

**Common fixes:**
- Clear Vercel cache: Deployments > ⋯ > Redeploy > Clear cache
- Rebuild: `git commit --allow-empty -m "Rebuild" && git push`

---

## Security Checklist

- [ ] Change `NEXTAUTH_SECRET` to strong random value
- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Enable Neon IP allowlist (if needed)
- [ ] Configure CORS for mobile app
- [ ] Enable Vercel Authentication (if needed)
- [ ] Set up environment variable protection
- [ ] Review and update security headers
- [ ] Enable Vercel Firewall (Pro plan)

---

## Cost Optimization

### Vercel Free Tier:
- ✅ 100 GB bandwidth
- ✅ Unlimited requests
- ✅ Automatic HTTPS
- ✅ Preview deployments

### Neon Free Tier:
- ✅ 3 GB storage
- ✅ Unlimited queries
- ✅ Auto-suspend (saves compute)
- ✅ Branching (3 branches)

### Tips:
1. Use Vercel Image Optimization
2. Enable Neon auto-suspend
3. Use ISR for static pages
4. Implement API caching

---

## Performance Optimization

### Database Query Optimization:

1. **Enable Prisma query logging:**
```typescript
// prisma/client.ts
log: ['query', 'info', 'warn', 'error']
```

2. **Use Neon Query Insights:**
   - Neon Dashboard > Monitoring > Queries
   - Identify slow queries
   - Add database indexes

### Vercel Edge Functions:

For faster API responses, consider Edge Functions:

```typescript
// pages/api/products.ts
export const config = {
  runtime: 'edge',
};
```

### Image Optimization:

Already configured in `next.config.js`:
- AVIF/WebP formats
- Automatic resizing
- CDN caching

---

## Scaling

### When to upgrade:

**Vercel Pro ($20/mo):**
- \>100 GB bandwidth
- Need password protection
- Want advanced analytics
- Require Firewall

**Neon Pro ($19/mo):**
- \>3 GB storage
- Need more compute
- Want point-in-time recovery
- Require more branches

---

## Backup and Recovery

### Neon Automatic Backups:

- **Point-in-time recovery**: Last 7 days (Pro plan)
- **Branching**: Create database copies instantly

### Manual Backup:

```bash
# Download backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Next Steps

1. ✅ Set up custom domain
2. ✅ Configure monitoring alerts
3. ✅ Set up CI/CD testing
4. ✅ Implement API rate limiting
5. ✅ Add error tracking (Sentry)
6. ✅ Configure CDN caching
7. ✅ Set up staging environment

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://prisma.io/docs

---

## Quick Reference Commands

```bash
# View logs
vercel logs --follow

# List deployments
vercel ls

# Pull environment variables
vercel env pull

# Run migrations
pnpm prisma migrate deploy

# Seed database
pnpm db:seed

# Check database
pnpm prisma studio

# Test build locally
pnpm build
pnpm start
```

---

**Deployment completed! 🎉**

Your HealthPeDhyan app is now live on:
- Frontend: https://your-app.vercel.app
- Database: Neon PostgreSQL (serverless)
- Mobile API: https://your-app.vercel.app/api
