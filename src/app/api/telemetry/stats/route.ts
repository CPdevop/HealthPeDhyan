import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTelemetryStats } from '@/lib/telemetry';
import { TelemetryEventType } from '@prisma/client';

/**
 * GET /api/telemetry/stats
 * Get telemetry statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType') as TelemetryEventType | null;
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await getTelemetryStats({
      startDate,
      eventType: eventType || undefined,
      limit: 100,
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Telemetry stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
