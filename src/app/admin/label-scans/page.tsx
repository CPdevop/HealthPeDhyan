import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getLabelScans() {
  const scans = await prisma.labelScan.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });
  return scans;
}

async function getStats() {
  const [total, completed, processing, failed] = await Promise.all([
    prisma.labelScan.count(),
    prisma.labelScan.count({ where: { status: 'COMPLETED' } }),
    prisma.labelScan.count({ where: { status: 'PROCESSING' } }),
    prisma.labelScan.count({ where: { status: 'FAILED' } }),
  ]);

  return { total, completed, processing, failed };
}

export default async function LabelScansPage() {
  const [scans, stats] = await Promise.all([
    getLabelScans(),
    getStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Label Scans</h1>
        <p className="mt-2 text-neutral-600">
          View all product label scans submitted by users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Scans</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Completed</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Processing</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Failed</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Scans List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">No scans yet</p>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={scan.imageUrl}
                      alt="Product label"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {scan.productName || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          Scanned {new Date(scan.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          scan.status === 'COMPLETED'
                            ? 'default'
                            : scan.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {scan.status}
                      </Badge>
                    </div>

                    {scan.healthScore !== null && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-600">Health Score:</span>
                          <span
                            className={`text-lg font-bold ${
                              scan.healthScore >= 70
                                ? 'text-green-600'
                                : scan.healthScore >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {scan.healthScore}/100
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
