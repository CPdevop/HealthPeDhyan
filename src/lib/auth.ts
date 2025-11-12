import { NextAuthOptions, Session, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
import { verifyOTP } from './otp';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      emailVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    emailVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    emailVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // First, check if user exists
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            emailVerified: true,
          }
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        // For ADMIN/EDITOR roles, OTP is required
        if ((user.role === UserRole.ADMIN || user.role === UserRole.EDITOR) && !credentials.otp) {
          throw new Error('OTP is required for admin access. Please use /api/auth/request-otp first.');
        }

        // Verify OTP for admin users
        if (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR) {
          console.log(`🔐 Verifying OTP for admin ${credentials.email}`);

          const isValidOTP = await verifyOTP(credentials.email, credentials.otp!);

          if (!isValidOTP) {
            console.log(`❌ Invalid or expired OTP for ${credentials.email}`);
            throw new Error('Invalid or expired OTP');
          }

          console.log(`✅ OTP verified for ${credentials.email}`);
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        // Update last login stats
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 }
          }
        });

        console.log(`✅ Login successful for ${credentials.email} (${user.role})`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = !!user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Check if user has required role
 */
export function hasRole(session: Session | null, requiredRole: UserRole): boolean {
  if (!session?.user) return false;
  if (requiredRole === UserRole.EDITOR && session.user.role === UserRole.ADMIN) return true;
  return session.user.role === requiredRole;
}

/**
 * Get user from session or throw
 */
export function requireAuth(session: Session | null): Session['user'] {
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

/**
 * Require specific role or throw
 */
export function requireRole(session: Session | null, role: UserRole): Session['user'] {
  const user = requireAuth(session);
  if (!hasRole(session, role)) {
    throw new Error('Forbidden: insufficient permissions');
  }
  return user;
}
