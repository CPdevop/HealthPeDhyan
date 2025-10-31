import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createAndSendOTP } from '@/lib/otp';

/**
 * Step 1 of login: Verify password and send OTP
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Step 1: Password verification for ${email}`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log(`✅ Password verified for ${email}`);
    console.log(`📧 Generating and sending OTP...`);

    // Password is correct - generate and send OTP
    await createAndSendOTP(email);

    return NextResponse.json({
      success: true,
      message: 'OTP has been sent to cpmjha@gmail.com',
      requiresOTP: true,
    });
  } catch (error: any) {
    console.error('❌ Request OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
