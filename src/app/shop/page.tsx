import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateMetadata as genMeta } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { mockProducts, mockCategories } from '@/lib/mock-data';

export const metadata = genMeta({
  title: 'Shop Healthy Products',
  description:
    'Browse our curated selection of palm-oil-free, low-sugar products made with clean ingredients.',
});

async function getProducts(searchParams: any) {
  try {
    const where: any = {};

    if (searchParams.palmOilFree === 'true') {
      where.isPalmOilFree = true;
    }
    if (searchParams.lowSugar === 'true') {
      where.isLowSugar = true;
    }
    if (searchParams.wholeGrain === 'true') {
      where.isWholeGrain = true;
    }
    if (searchParams.category) {
      where.category = { slug: searchParams.category };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        badges: {
          include: { badge: true },
        },
        affiliateLinks: true,
      },
      orderBy: {
        healthScore: 'desc',
      },
    });

    return products;
  } catch (error) {
    console.log('Database not available, using mock data');
    return null;
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  } catch (error) {
    console.log('Database not available, using mock data');
    return null;
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const [dbProducts, dbCategories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  // Use database data if available, otherwise use mock data
  let products = dbProducts && dbProducts.length > 0 ? dbProducts : mockProducts;
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : mockCategories.map(cat => ({
    ...cat,
    _count: { products: mockProducts.filter(p => p.category.name === cat.name).length }
  }));
  const usingMockData = !dbProducts || dbProducts.length === 0;

  // Apply filters to mock data
  if (usingMockData && searchParams) {
    products = products.filter((p: any) => {
      if (searchParams.palmOilFree === 'true' && !p.isPalmOilFree) return false;
      if (searchParams.lowSugar === 'true' && !p.isLowSugar) return false;
      if (searchParams.wholeGrain === 'true' && !p.isWholeGrain) return false;
      if (searchParams.category && p.category.slug !== searchParams.category) return false;
      return true;
    });
  }

  const activeCategory = searchParams.category;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {usingMockData && (
        <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-4 text-center">
          <p className="text-sm font-medium">
            🌟 Demo Mode - Viewing Sample Products | Full catalog available after backend deployment
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900">Shop Healthy Products</h1>
        <p className="mt-2 text-neutral-600">
          All products meet our health standards for clean ingredients
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/shop"
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm transition-colors',
                  !activeCategory
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    activeCategory === category.slug
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-neutral-500">
                    {category._count.products}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Health Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/shop${activeCategory ? `?category=${activeCategory}&` : '?'}palmOilFree=true`}
                className="block"
              >
                <Badge
                  variant={searchParams.palmOilFree === 'true' ? 'success' : 'outline'}
                  className="w-full justify-center cursor-pointer hover:opacity-80"
                >
                  Palm Oil Free
                </Badge>
              </Link>
              <Link
                href={`/shop${activeCategory ? `?category=${activeCategory}&` : '?'}lowSugar=true`}
                className="block"
              >
                <Badge
                  variant={searchParams.lowSugar === 'true' ? 'success' : 'outline'}
                  className="w-full justify-center cursor-pointer hover:opacity-80"
                >
                  Low Sugar
                </Badge>
              </Link>
              <Link
                href={`/shop${activeCategory ? `?category=${activeCategory}&` : '?'}wholeGrain=true`}
                className="block"
              >
                <Badge
                  variant={searchParams.wholeGrain === 'true' ? 'success' : 'outline'}
                  className="w-full justify-center cursor-pointer hover:opacity-80"
                >
                  Whole Grain
                </Badge>
              </Link>
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No products found matching your filters.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/shop">Clear Filters</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
