'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying Your Email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can now login to your account and start exploring healthy products.
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button onClick={() => router.push('/signup')} className="w-full">
                  Create New Account
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/" className="text-sm text-green-600 hover:text-green-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
