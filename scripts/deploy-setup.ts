#!/usr/bin/env tsx

/**
 * Deployment Setup Script
 * Helps prepare HealthPeDhyan for Vercel + Neon deployment
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message: string) {
  console.log('\n' + '='.repeat(60));
  log(`  ${message}`, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

function success(message: string) {
  log(`✓ ${message}`, colors.green);
}

function warning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function error(message: string) {
  log(`✗ ${message}`, colors.red);
}

function checkCommand(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkEnvFile(filename: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filename));
}

async function main() {
  header('HealthPeDhyan - Deployment Setup');

  log('This script will help you prepare for deployment to Vercel + Neon\n');

  // 1. Check Prerequisites
  header('1. Checking Prerequisites');

  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`);
  if (parseInt(nodeVersion.split('.')[0].replace('v', '')) >= 18) {
    success('Node.js version is compatible');
  } else {
    error('Node.js version must be >= 18.0.0');
    process.exit(1);
  }

  // Check pnpm
  if (checkCommand('pnpm')) {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    success(`pnpm installed (v${pnpmVersion})`);
  } else {
    warning('pnpm not found. Install with: npm install -g pnpm');
  }

  // Check git
  if (checkCommand('git')) {
    success('git installed');
  } else {
    error('git not found. Please install git');
    process.exit(1);
  }

  // Check Vercel CLI (optional)
  if (checkCommand('vercel')) {
    success('Vercel CLI installed');
  } else {
    warning('Vercel CLI not found. Install with: pnpm install -g vercel');
  }

  // 2. Check Environment Files
  header('2. Checking Environment Configuration');

  if (checkEnvFile('.env')) {
    success('.env file exists');
  } else {
    warning('.env file not found');
    log('  Create it with: cp .env.example .env');
  }

  if (checkEnvFile('.env.production.example')) {
    success('.env.production.example exists (template for production)');
  }

  // 3. Check Prisma Setup
  header('3. Checking Prisma Setup');

  if (fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma'))) {
    success('Prisma schema found');
  } else {
    error('Prisma schema not found');
    process.exit(1);
  }

  try {
    log('Generating Prisma client...');
    execSync('pnpm prisma generate', { stdio: 'inherit' });
    success('Prisma client generated');
  } catch (err) {
    error('Failed to generate Prisma client');
    process.exit(1);
  }

  // 4. Check Build Configuration
  header('4. Checking Build Configuration');

  if (fs.existsSync(path.join(process.cwd(), 'vercel.json'))) {
    success('vercel.json configuration found');
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8')
    );
    log(`  Build command: ${vercelConfig.buildCommand}`);
    log(`  Install command: ${vercelConfig.installCommand}`);
  } else {
    warning('vercel.json not found');
  }

  if (fs.existsSync(path.join(process.cwd(), 'next.config.js'))) {
    success('next.config.js found');
  }

  // 5. Test Build
  header('5. Testing Local Build');

  log('Running production build test...\n');
  try {
    execSync('pnpm build', { stdio: 'inherit' });
    success('\nProduction build successful!');
  } catch (err) {
    error('\nProduction build failed. Fix errors before deploying.');
    process.exit(1);
  }

  // 6. Type Check
  header('6. Running Type Check');

  try {
    execSync('pnpm typecheck', { stdio: 'inherit' });
    success('Type check passed');
  } catch (err) {
    warning('Type check failed. Fix TypeScript errors before deploying.');
  }

  // 7. Deployment Checklist
  header('7. Deployment Checklist');

  const checklist = [
    'Create Neon account at https://neon.tech',
    'Create new Neon project and database',
    'Copy Neon connection string (pooled connection)',
    'Create Vercel account at https://vercel.com',
    'Push code to GitHub/GitLab/Bitbucket',
    'Import project in Vercel dashboard',
    'Add environment variables in Vercel (DATABASE_URL, NEXTAUTH_SECRET, etc.)',
    'Deploy and monitor build logs',
    'Verify migrations ran successfully',
    'Test deployed application',
    'Update NEXTAUTH_URL with actual deployment URL',
  ];

  log('Complete these steps:\n');
  checklist.forEach((item, index) => {
    log(`  ${index + 1}. ${item}`);
  });

  // 8. Required Environment Variables
  header('8. Required Environment Variables');

  const requiredVars = [
    { name: 'DATABASE_URL', description: 'Neon PostgreSQL connection string' },
    { name: 'NEXTAUTH_SECRET', description: 'Generate with: openssl rand -base64 32' },
    { name: 'NEXTAUTH_URL', description: 'Your deployment URL (e.g., https://your-app.vercel.app)' },
    { name: 'NEXT_PUBLIC_APP_URL', description: 'Same as NEXTAUTH_URL' },
    { name: 'NEXT_PUBLIC_APP_NAME', description: 'HealthPeDhyan' },
  ];

  log('Set these in Vercel Dashboard > Settings > Environment Variables:\n');
  requiredVars.forEach(({ name, description }) => {
    log(`  ${name}`, colors.cyan);
    log(`    ${description}\n`);
  });

  // 9. Optional Variables
  header('9. Optional Environment Variables');

  const optionalVars = [
    'ADMIN_EMAIL - Admin user email for seeding',
    'ADMIN_PASSWORD - Admin user password',
    'GMAIL_USER - For OTP emails',
    'GMAIL_APP_PASSWORD - Gmail app password',
    'AFFILIATE_AMAZON_TAG - Amazon affiliate tag',
    'AFFILIATE_FLIPKART_PARAM - Flipkart affiliate ID',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID - Google Analytics ID',
  ];

  log('These are optional but recommended:\n');
  optionalVars.forEach((item) => {
    log(`  • ${item}`);
  });

  // 10. Next Steps
  header('10. Next Steps');

  log('1. Read the deployment guide:');
  log('   cat DEPLOYMENT_VERCEL_NEON.md\n');

  log('2. Set up Neon database:');
  log('   https://console.neon.tech\n');

  log('3. Deploy to Vercel:');
  log('   https://vercel.com/dashboard\n');

  log('4. Or use Vercel CLI:');
  log('   pnpm vercel:deploy\n');

  header('Setup Check Complete!');
  success('Your application is ready for deployment');
  log('\nFor detailed instructions, see: DEPLOYMENT_VERCEL_NEON.md\n');
}

main().catch((err) => {
  error(`Setup failed: ${err.message}`);
  process.exit(1);
});
