#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@healthpedhyan.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin User';

  console.log('🔐 Creating admin user...');
  console.log('Email:', email);

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create or update admin user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'ADMIN',
      },
      create: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', user.role);
    console.log('\n👉 You can now login at http://localhost:3000/admin/login');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);

    if (error.code === 'P2002') {
      console.log('\n💡 User already exists. Try updating the password instead.');
    } else if (error.code === 'P2021') {
      console.log('\n💡 Table does not exist. Run migrations first:');
      console.log('   pnpm db:migrate');
    } else {
      console.log('\n💡 Make sure your database is running and DATABASE_URL is correct in .env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
