import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Video } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DeleteButton } from '@/components/admin/delete-button';

export default async function ArticlesListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const articles = await prisma.article.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Articles</h1>
          <p className="mt-2 text-neutral-600">Manage your blog posts and articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles ({articles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-neutral-900">{article.title}</h3>
                    {article.videoUrl && (
                      <Badge variant="secondary">
                        <Video className="mr-1 h-3 w-3" />
                        Video
                      </Badge>
                    )}
                    <Badge variant={article.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                      {article.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {article.category && <span>{article.category} · </span>}
                    {article.publishedAt ? formatDate(article.publishedAt) : 'Not published'}
                  </div>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/articles/${article.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteButton id={article.id} type="article" title={article.title} />
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-600">No articles yet. Write your first article!</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/articles/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Article
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
