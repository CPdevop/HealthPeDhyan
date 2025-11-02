import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { DeleteButton } from '@/components/admin/delete-button';

export default async function ProductsListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      badges: {
        include: { badge: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="mt-2 text-neutral-600">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-neutral-900">{product.title}</h3>
                    {product.isMeetsStandard && (
                      <Badge variant="success">Meets Standard</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <span>{product.brand.name}</span>
                    <span>·</span>
                    <span>{product.category.name}</span>
                    <span>·</span>
                    <span>Health Score: {product.healthScore}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.badges.slice(0, 3).map((pb) => (
                      <Badge key={pb.badge.id} variant="secondary" className="text-xs">
                        {pb.badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/products/${product.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteButton id={product.id} type="product" title={product.title} />
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-600">No products yet. Add your first product!</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
