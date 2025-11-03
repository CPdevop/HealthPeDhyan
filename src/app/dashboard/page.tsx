import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Bookmark,
  Eye,
  TrendingUp,
  Heart,
  Settings,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import LogoutButton from '@/components/dashboard/logout-button';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Fetch user data with related information
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      bookmarks: {
        include: {
          product: true,
          article: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      productViews: {
        include: {
          product: true,
        },
        orderBy: { viewedAt: 'desc' },
        take: 5,
      },
      searchHistory: {
        orderBy: { searchedAt: 'desc' },
        take: 5,
      },
    },
  });

  // Calculate stats
  const stats = {
    bookmarks: await prisma.bookmark.count({
      where: { userId: session.user.id },
    }),
    productViews: await prisma.productView.count({
      where: { userId: session.user.id },
    }),
    searchHistory: await prisma.searchHistory.count({
      where: { userId: session.user.id },
    }),
    lists: await prisma.userList.count({
      where: { userId: session.user.id },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <h1 className="text-2xl font-bold text-green-600">
                  HealthPeDhyan™
                </h1>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/shop">
                <Button variant="ghost">Browse Products</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost">Articles</Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="ghost">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userData?.name || 'User'}! 👋
          </h2>
          <p className="text-gray-600">
            {userData?.emailVerified
              ? 'Here\'s your health journey overview'
              : 'Please verify your email to unlock all features'}
          </p>
          {!userData?.emailVerified && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Your email is not verified. Please check your inbox for the verification link.
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Bookmarks
              </CardTitle>
              <Bookmark className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookmarks}</div>
              <p className="text-xs text-gray-500 mt-1">
                Products & Articles saved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Recently Viewed
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productViews}</div>
              <p className="text-xs text-gray-500 mt-1">
                Products explored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Searches
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.searchHistory}</div>
              <p className="text-xs text-gray-500 mt-1">
                Search queries made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                My Lists
              </CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lists}</div>
              <p className="text-xs text-gray-500 mt-1">
                Custom collections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookmarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Bookmarks</span>
                <Link href="/dashboard/bookmarks">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userData?.bookmarks && userData.bookmarks.length > 0 ? (
                <div className="space-y-4">
                  {userData.bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Bookmark className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {bookmark.product?.name || bookmark.article?.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {bookmark.notes || 'No notes'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(bookmark.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No bookmarks yet</p>
                  <Link href="/shop">
                    <Button variant="link" size="sm" className="mt-2">
                      Start exploring products
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Viewed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recently Viewed</span>
                <Link href="/dashboard/history">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userData?.productViews && userData.productViews.length > 0 ? (
                <div className="space-y-4">
                  {userData.productViews.map((view) => (
                    <div key={view.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {view.product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {view.product.brand}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(view.viewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No viewing history yet</p>
                  <Link href="/shop">
                    <Button variant="link" size="sm" className="mt-2">
                      Explore products
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Profile CTA */}
        {!userData?.profile?.healthGoals && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Complete Your Health Profile
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set your dietary preferences and health goals to get personalized product recommendations
                  </p>
                </div>
                <Link href="/dashboard/profile">
                  <Button>
                    <User className="h-4 w-4 mr-2" />
                    Set Up Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
