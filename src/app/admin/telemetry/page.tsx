'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TelemetryStats {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  eventCounts: Array<{
    eventType: string;
    eventName: string;
    _count: number;
  }>;
  topPages: Array<{
    path: string;
    _count: number;
  }>;
}

export default function TelemetryAdminPage() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, [days, eventTypeFilter]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: days.toString(),
      });

      if (eventTypeFilter) {
        params.append('eventType', eventTypeFilter);
      }

      const response = await fetch(`/api/telemetry/stats?${params}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch telemetry stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading telemetry data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Telemetry & Analytics</h1>
          <p className="text-neutral-600">Application usage and performance metrics</p>
        </div>

        <div className="flex gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="rounded-lg border border-neutral-300 px-4 py-2"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 px-4 py-2"
          >
            <option value="">All Event Types</option>
            <option value="PAGE_VIEW">Page Views</option>
            <option value="USER_ACTION">User Actions</option>
            <option value="API_CALL">API Calls</option>
            <option value="ERROR">Errors</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="FEATURE_USAGE">Feature Usage</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-600">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalEvents.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-600">
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.uniqueUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-600">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.uniqueSessions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Most Visited Pages</CardTitle>
          <CardDescription>Top pages by view count</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.topPages && stats.topPages.length > 0 ? (
            <div className="space-y-2">
              {stats.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {index + 1}
                    </div>
                    <span className="font-mono text-sm">{page.path}</span>
                  </div>
                  <div className="text-lg font-semibold">{page._count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No page view data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Event Breakdown</CardTitle>
          <CardDescription>All tracked events sorted by frequency</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.eventCounts && stats.eventCounts.length > 0 ? (
            <div className="space-y-1">
              {stats.eventCounts.map((event) => (
                <div
                  key={`${event.eventType}-${event.eventName}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {event.eventType}
                    </span>
                    <span className="font-mono text-sm">{event.eventName}</span>
                  </div>
                  <div className="font-semibold">{event._count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No event data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
