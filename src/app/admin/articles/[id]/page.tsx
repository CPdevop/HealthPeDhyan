import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleForm } from '@/components/admin/article-form';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      author: true,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Edit Article</h1>
        <p className="mt-2 text-neutral-600">Update article content and settings</p>
      </div>

      <ArticleForm article={article} />
    </div>
  );
}
