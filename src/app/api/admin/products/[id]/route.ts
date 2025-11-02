import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/admin/products/[id]
 * Update a product (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const body = await request.json();

    // Update product and badges in a transaction
    await prisma.$transaction(async (tx) => {
      // Update product
      await tx.product.update({
        where: { id: productId },
        data: {
          title: body.title,
          slug: body.slug,
          brandId: body.brandId,
          categoryId: body.categoryId,
          shortSummary: body.shortSummary,
          description: body.description,
          ingredientsText: body.ingredientsText,
          allergensText: body.allergensText,
          healthScore: body.healthScore,
          isPalmOilFree: body.isPalmOilFree,
          isArtificialColorFree: body.isArtificialColorFree,
          isLowSugar: body.isLowSugar,
          isWholeGrain: body.isWholeGrain,
          isMeetsStandard: body.isMeetsStandard,
        },
      });

      // Delete existing badges
      await tx.productBadge.deleteMany({
        where: { productId },
      });

      // Add new badges
      if (body.badges && body.badges.length > 0) {
        await tx.productBadge.createMany({
          data: body.badges.map((badgeId: string) => ({
            productId,
            badgeId,
          })),
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete a product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;

    // Delete related records first (due to foreign key constraints)
    await prisma.$transaction([
      // Delete product badges
      prisma.productBadge.deleteMany({
        where: { productId },
      }),
      // Delete affiliate links
      prisma.affiliateLink.deleteMany({
        where: { productId },
      }),
      // Delete label scans
      prisma.labelScan.deleteMany({
        where: { productId },
      }),
      // Finally delete the product
      prisma.product.delete({
        where: { id: productId },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
