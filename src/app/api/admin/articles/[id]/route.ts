import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/admin/articles/[id]
 * Update an article (admin only)
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

    const articleId = params.id;
    const body = await request.json();

    // Update article
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        bodyMarkdown: body.bodyMarkdown,
        coverImage: body.coverImage,
        videoUrl: body.videoUrl,
        category: body.category,
        tags: body.tags,
        status: body.status,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      },
    });

    return NextResponse.json({ success: true, message: 'Article updated successfully' });
  } catch (error: any) {
    console.error('Article update error:', error);
    return NextResponse.json(
      { error: 'Failed to update article', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/articles/[id]
 * Delete an article (admin only)
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

    const articleId = params.id;

    // Delete the article
    await prisma.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Article delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete article', details: error.message },
      { status: 500 }
    );
  }
}
