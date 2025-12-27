# Quick Start: Deploy to Vercel + Neon

Deploy HealthPeDhyan in under 15 minutes.

## Prerequisites

- GitHub account (with this repo)
- Vercel account (free): https://vercel.com
- Neon account (free): https://neon.tech

---

## Step 1: Create Neon Database (3 minutes)

1. Go to https://console.neon.tech
2. Click **"New Project"**
3. Name: `healthpedhyan`
4. Region: Choose closest to your users
5. Click **"Create Project"**
6. Copy the **pooled connection string**:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
7. **Save it** - you'll need it next

---

## Step 2: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** > **"Project"**
3. Import your GitHub repository
4. **⚠️ IMPORTANT**: Add environment variables BEFORE deploying:

   ```bash
   # Required - MUST SET THESE BEFORE FIRST DEPLOYMENT
   DATABASE_URL=<paste-your-neon-connection-string-from-step-1>
   NEXTAUTH_SECRET=<generate-random-string>
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_NAME=HealthPeDhyan
   NODE_ENV=production

   # Optional (recommended)
   ADMIN_EMAIL=admin@healthpedhyan.com
   ADMIN_PASSWORD=ChangeMe123!
   ADMIN_NAME=Admin User
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

   **⚠️ CRITICAL**: The `DATABASE_URL` must be set BEFORE clicking deploy, otherwise database migrations will fail during build!

5. Click **"Deploy"**
6. Wait 2-3 minutes

---

## Step 3: Update URLs (1 minute)

After first deployment:

1. Copy your Vercel URL (e.g., `https://healthpedhyan-abc123.vercel.app`)
2. Go to Vercel > Settings > Environment Variables
3. Update:
   - `NEXTAUTH_URL` → your actual URL
   - `NEXT_PUBLIC_APP_URL` → your actual URL
4. Redeploy: Deployments > ⋯ > Redeploy

---

## Step 4: Verify (2 minutes)

Test your deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Visit homepage
open https://your-app.vercel.app
```

---

## Step 5: Configure Mobile App (2 minutes)

Update your mobile app API endpoint:

```typescript
// mobile/src/services/api.ts
const API_BASE_URL = 'https://your-app.vercel.app/api';
```

---

## Done! 🎉

Your HealthPeDhyan app is now live:

- **Frontend**: https://your-app.vercel.app
- **API**: https://your-app.vercel.app/api
- **Database**: Neon PostgreSQL (serverless)

---

## Next Steps (Optional)

- [ ] Add custom domain (Vercel > Settings > Domains)
- [ ] Set up Gmail for OTP emails (add `GMAIL_USER` and `GMAIL_APP_PASSWORD`)
- [ ] Seed database: `pnpm db:seed`
- [ ] Configure analytics (add `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- [ ] Set up monitoring (Vercel Analytics)

---

## Need Help?

**Detailed Guide**: See `DEPLOYMENT_VERCEL_NEON.md`

**Run Setup Check**:
```bash
pnpm deploy:setup
```

**Common Issues**:

1. **Build fails with "table does not exist"**:
   - ❌ DATABASE_URL not set in Vercel environment variables
   - ✅ Go to Vercel > Settings > Environment Variables
   - ✅ Add DATABASE_URL with your Neon connection string
   - ✅ Redeploy: Deployments > ⋯ > Redeploy

2. **Database connection fails**:
   - Verify `DATABASE_URL` includes `?sslmode=require`
   - Check Neon database is running (not paused)

3. **Migrations fail**:
   - Ensure Neon database is accessible
   - Use the **pooled connection** string from Neon

4. **Build works locally but fails on Vercel**:
   - Check all environment variables are set in Vercel
   - Make sure DATABASE_URL is correct

**Support**:
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs

---

## Deployment Summary

| Component | Service | Cost |
|-----------|---------|------|
| Frontend/App | Vercel | Free (100GB bandwidth) |
| Database | Neon | Free (3GB storage) |
| SSL/HTTPS | Vercel | Free (automatic) |
| CDN | Vercel | Free (automatic) |

**Total Cost**: $0/month (within free tier limits)
