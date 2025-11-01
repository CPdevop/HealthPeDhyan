import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/telemetry';
import { TelemetryEventType } from '@prisma/client';

/**
 * POST /api/telemetry
 * Track telemetry events from client-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      undefined;

    // Validate event type
    const validEventTypes: TelemetryEventType[] = [
      'PAGE_VIEW',
      'USER_ACTION',
      'API_CALL',
      'ERROR',
      'PERFORMANCE',
      'FEATURE_USAGE',
    ];

    if (!validEventTypes.includes(body.eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    if (!body.eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Track the event
    await trackEvent({
      eventType: body.eventType,
      eventName: body.eventName,
      userId: body.userId,
      sessionId: body.sessionId,
      userAgent,
      ipAddress,
      path: body.path,
      referrer: body.referrer,
      properties: body.properties,
      duration: body.duration,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telemetry API error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/telemetry/stats
 * Get telemetry statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession(authOptions);
    // if (session?.user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType') as TelemetryEventType | null;
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { getTelemetryStats } = await import('@/lib/telemetry');

    const stats = await getTelemetryStats({
      startDate,
      eventType: eventType || undefined,
      limit: 100,
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Telemetry stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
