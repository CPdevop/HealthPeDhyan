import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';
import { ProductCard } from '@/components/product-card';
import { mockProducts, mockArticles } from '@/lib/mock-data';
import Image from 'next/image';

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: {
        isMeetsStandard: true,
      },
      include: {
        brand: true,
        category: true,
        badges: {
          include: {
            badge: true,
          },
        },
        affiliateLinks: true,
      },
      take: 6,
      orderBy: {
        healthScore: 'desc',
      },
    });
  } catch (error) {
    // Return mock data if database is not available
    console.log('Database not available, using mock data');
    return null;
  }
}

async function getRecentArticles() {
  try {
    return await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3,
    });
  } catch (error) {
    // Return mock data if database is not available
    console.log('Database not available, using mock data');
    return null;
  }
}

export default async function HomePage() {
  const [dbProducts, dbArticles] = await Promise.all([getFeaturedProducts(), getRecentArticles()]);

  // Use database data if available, otherwise use mock data
  const products = dbProducts && dbProducts.length > 0 ? dbProducts : mockProducts;
  const articles = dbArticles && dbArticles.length > 0 ? dbArticles : mockArticles;
  const usingMockData = !dbProducts || dbProducts.length === 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteSchema()) }}
      />

      {/* Demo Mode Banner */}
      {usingMockData && (
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-3">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center text-white">
              <p className="text-sm font-medium">
                🌟 Demo Mode - Viewing Sample Products | Full catalog available after backend deployment
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              Healthy choices made easy
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 max-w-2xl mx-auto">
              Discover products free from palm oil, low in sugar, and made with clean ingredients.
              We do the research, you make healthier choices.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/shop">Shop Healthier Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/standards">Our Standards</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Featured Products
              </h2>
              <p className="mt-2 text-neutral-600">
                Curated picks that meet our health standards
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/shop">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {usingMockData && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Deploy your backend to see your full product catalog. See{' '}
                  <Link href="/docs/deployment" className="underline font-medium">
                    DEPLOYMENT_GUIDE.md
                  </Link>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How We Choose */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
              How We Choose Products
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Every product is evaluated against our strict health standards. We check for palm oil,
              artificial colors, trans fats, and sugar content.
            </p>
            <Button asChild className="mt-8">
              <Link href="/standards">See Our Complete Standards</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Highlights */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Latest Articles</h2>
              <p className="mt-2 text-neutral-600">
                Learn about ingredients, nutrition, and healthier choices
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/blog">View All Articles</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-0">
                  {article.coverImage && (
                    <Link href={`/blog/${article.slug}`} className="block relative aspect-video overflow-hidden">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}
                  <div className="p-6">
                    {article.category && (
                      <Badge variant="secondary" className="w-fit mb-3">
                        {article.category}
                      </Badge>
                    )}
                    <CardTitle className="text-xl leading-tight">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-xs mt-2">
                      {article.publishedAt ? formatDate(article.publishedAt) : 'Draft'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-neutral-600 line-clamp-3 mb-4">{article.excerpt}</p>
                  <Button asChild variant="link" className="px-0 font-semibold group-hover:gap-2 transition-all">
                    <Link href={`/blog/${article.slug}`}>
                      Read Full Article <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
