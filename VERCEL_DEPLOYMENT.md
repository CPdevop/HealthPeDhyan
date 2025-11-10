# Vercel Deployment Guide

This guide will help you deploy HealthPeDhyan to Vercel for production use, making the backend available for your mobile app.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A PostgreSQL database (we recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com) for free PostgreSQL)
3. Vercel CLI installed (optional): `pnpm install -g vercel`

## Step 1: Set Up PostgreSQL Database

### Option A: Using Neon (Recommended)

1. Go to [Neon](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host.neon.tech/dbname`)
4. Save this for the next step

### Option B: Using Supabase

1. Go to [Supabase](https://supabase.com) and sign up
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (Connection pooling mode recommended)
5. Save this for the next step

### Option C: Using Vercel Postgres

1. In your Vercel project dashboard
2. Go to Storage tab
3. Create a Postgres database
4. Copy the connection string

## Step 2: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm prisma generate && pnpm build`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Output Directory**: `.next`
   - **Root Directory**: `./`

6. Add environment variables (see Step 3)
7. Click "Deploy"

### Method 2: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts to configure your project
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?schema=public

# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=HealthPeDhyan
```

### Optional Variables

```bash
# Affiliate Parameters
AFFILIATE_AMAZON_TAG=your-amazon-tag
AFFILIATE_FLIPKART_PARAM=your-flipkart-affid

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Image Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Generate NEXTAUTH_SECRET

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 4: Run Database Migrations

After deployment, you need to run Prisma migrations:

### Option 1: Using Vercel CLI

```bash
# Set environment variable locally
export DATABASE_URL="your-production-database-url"

# Run migrations
pnpm prisma migrate deploy

# Seed the database (optional)
pnpm db:seed
```

### Option 2: Using Vercel Build Command

The migrations will run automatically during build if you update the build command in `vercel.json` or project settings:

```bash
pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
```

## Step 5: Verify Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test the landing page loads correctly
3. Try logging in (if you seeded the database)
4. Check the API endpoints work:
   - `https://your-app.vercel.app/api/health`
   - `https://your-app.vercel.app/api/auth/providers`

## Step 6: Set Up for Mobile App

Your backend is now live and can be accessed by your mobile app!

### API Base URL

Update your mobile app configuration to use:

```
BACKEND_URL=https://your-app.vercel.app
API_BASE_URL=https://your-app.vercel.app/api
```

### Available API Endpoints

```
POST   /api/auth/signin           - User login
POST   /api/auth/signout          - User logout
GET    /api/auth/session          - Get current session
POST   /api/auth/signup           - User registration
GET    /api/products              - Get products
POST   /api/products              - Create product
GET    /api/products/:id          - Get product details
POST   /api/scan                  - Scan product barcode
GET    /api/health                - Health check
```

### Authentication

The mobile app should use NextAuth.js session-based authentication:

1. Login via `/api/auth/signin`
2. Store the session cookie
3. Include the cookie in subsequent requests

## Docker Deployment (Alternative)

If you prefer to self-host using Docker instead of Vercel:

### Build and Run with Docker Compose

```bash
# Create .env file with production values
cp .env.production.example .env

# Update the .env file with your production values

# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

### Build Docker Image Only

```bash
# Build the image
docker build -t healthpedhyan:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host/db" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  -e NEXTAUTH_SECRET="your-secret" \
  healthpedhyan:latest
```

## Monitoring and Logs

### Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# View specific deployment logs
vercel logs [deployment-url]
```

### Check Deployment Status

```bash
vercel ls
```

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct and accessible from Vercel
- Check if database requires SSL: add `?sslmode=require` to connection string
- Ensure database firewall allows Vercel IP ranges

### Build Failures

- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Prisma schema is valid

### Runtime Errors

- Check function logs in Vercel dashboard
- Verify all required environment variables are set
- Check database connectivity

## Security Checklist

- [ ] Change default NEXTAUTH_SECRET to a strong random value
- [ ] Update ADMIN_PASSWORD from default value
- [ ] Enable database SSL connection
- [ ] Configure CORS if needed for mobile app
- [ ] Set up proper authentication for admin routes
- [ ] Review and update security headers in next.config.js
- [ ] Enable rate limiting for API endpoints (consider Vercel Edge Config)

## Performance Optimization

### Recommended Vercel Settings

- Enable Edge Functions for API routes (if compatible)
- Configure ISR (Incremental Static Regeneration) for product pages
- Use Vercel Image Optimization for product images
- Enable Vercel Analytics for monitoring

### Database Connection Pooling

For better performance with serverless functions, use connection pooling:

```bash
# Use Prisma Data Proxy or PgBouncer
DATABASE_URL="postgresql://user:password@pooler.host/db?pgbouncer=true"
```

## Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your main branch.

### Manual Deployments

```bash
# Deploy latest changes
vercel --prod

# Deploy specific branch
vercel --prod --branch feature-branch
```

## Cost Considerations

### Vercel Free Tier Includes:

- 100 GB bandwidth
- 6,000 build minutes
- Unlimited API requests
- 1 GB PostgreSQL (if using Vercel Postgres)

### Scaling Beyond Free Tier

- Pro Plan: $20/month - suitable for small to medium apps
- Enterprise: Custom pricing - for high-traffic apps

## Next Steps

1. Set up custom domain in Vercel dashboard
2. Configure SSL certificate (automatic with Vercel)
3. Set up monitoring and alerts
4. Implement API rate limiting
5. Configure CDN for static assets
6. Set up CI/CD pipelines for testing before deployment

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
