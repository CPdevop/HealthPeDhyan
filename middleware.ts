export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/bookmarks/:path*',
    '/api/profile/:path*',
    '/api/user/:path*',
  ],
};
