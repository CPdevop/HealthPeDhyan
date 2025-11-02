import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const [product, brands, categories, badges] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        category: true,
        badges: {
          include: { badge: true },
        },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.badge.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Edit Product</h1>
        <p className="mt-2 text-neutral-600">Update product information</p>
      </div>

      <ProductForm product={product} brands={brands} categories={categories} badges={badges} />
    </div>
  );
}
