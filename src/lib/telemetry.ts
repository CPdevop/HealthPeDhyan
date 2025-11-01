import { prisma } from '@/lib/prisma';
import { TelemetryEventType } from '@prisma/client';

// Telemetry configuration
const TELEMETRY_ENABLED = process.env.TELEMETRY_ENABLED !== 'false';
const TELEMETRY_SAMPLING_RATE = parseFloat(process.env.TELEMETRY_SAMPLING_RATE || '1.0');

/**
 * Telemetry event data structure
 */
export interface TelemetryEventData {
  eventType: TelemetryEventType;
  eventName: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  path?: string;
  referrer?: string;
  properties?: Record<string, any>;
  duration?: number;
}

/**
 * Check if telemetry should be tracked (based on sampling rate)
 */
function shouldTrack(): boolean {
  if (!TELEMETRY_ENABLED) return false;
  return Math.random() < TELEMETRY_SAMPLING_RATE;
}

/**
 * Track a telemetry event
 */
export async function trackEvent(data: TelemetryEventData): Promise<void> {
  try {
    // Check sampling rate
    if (!shouldTrack()) {
      return;
    }

    // Generate unique ID
    const id = `tel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in database
    await prisma.telemetryEvent.create({
      data: {
        id,
        eventType: data.eventType,
        eventName: data.eventName,
        userId: data.userId,
        sessionId: data.sessionId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        path: data.path,
        referrer: data.referrer,
        properties: data.properties || {},
        duration: data.duration,
      },
    });

    console.log(`📊 Telemetry: ${data.eventType} - ${data.eventName}`);
  } catch (error) {
    // Silently fail - don't break the app if telemetry fails
    console.error('Telemetry error:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(data: {
  path: string;
  referrer?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  duration?: number;
}): Promise<void> {
  await trackEvent({
    eventType: 'PAGE_VIEW',
    eventName: `page_view:${data.path}`,
    ...data,
  });
}

/**
 * Track user action (button click, form submit, etc.)
 */
export async function trackUserAction(data: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  path?: string;
  properties?: Record<string, any>;
}): Promise<void> {
  await trackEvent({
    eventType: 'USER_ACTION',
    eventName: data.action,
    userId: data.userId,
    sessionId: data.sessionId,
    path: data.path,
    properties: {
      category: data.category,
      label: data.label,
      value: data.value,
      ...data.properties,
    },
  });
}

/**
 * Track API call
 */
export async function trackApiCall(data: {
  method: string;
  endpoint: string;
  statusCode: number;
  duration: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
}): Promise<void> {
  await trackEvent({
    eventType: 'API_CALL',
    eventName: `${data.method}:${data.endpoint}`,
    userId: data.userId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    path: data.endpoint,
    duration: data.duration,
    properties: {
      method: data.method,
      statusCode: data.statusCode,
      error: data.error,
    },
  });
}

/**
 * Track error
 */
export async function trackError(data: {
  error: Error;
  errorType?: string;
  path?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  properties?: Record<string, any>;
}): Promise<void> {
  await trackEvent({
    eventType: 'ERROR',
    eventName: data.error.name || 'UnknownError',
    userId: data.userId,
    sessionId: data.sessionId,
    userAgent: data.userAgent,
    path: data.path,
    properties: {
      message: data.error.message,
      stack: data.error.stack,
      errorType: data.errorType,
      ...data.properties,
    },
  });
}

/**
 * Track performance metric
 */
export async function trackPerformance(data: {
  metric: string;
  value: number;
  path?: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}): Promise<void> {
  await trackEvent({
    eventType: 'PERFORMANCE',
    eventName: `performance:${data.metric}`,
    userId: data.userId,
    sessionId: data.sessionId,
    path: data.path,
    duration: data.value,
    properties: data.properties,
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(data: {
  feature: string;
  action: string;
  userId?: string;
  sessionId?: string;
  path?: string;
  properties?: Record<string, any>;
}): Promise<void> {
  await trackEvent({
    eventType: 'FEATURE_USAGE',
    eventName: `${data.feature}:${data.action}`,
    userId: data.userId,
    sessionId: data.sessionId,
    path: data.path,
    properties: data.properties,
  });
}

/**
 * Get telemetry statistics
 */
export async function getTelemetryStats(options: {
  startDate?: Date;
  endDate?: Date;
  eventType?: TelemetryEventType;
  limit?: number;
}) {
  const { startDate, endDate, eventType, limit = 100 } = options;

  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (eventType) {
    where.eventType = eventType;
  }

  // Get event counts by type
  const eventCounts = await prisma.telemetryEvent.groupBy({
    by: ['eventType', 'eventName'],
    where,
    _count: true,
    orderBy: {
      _count: {
        eventName: 'desc',
      },
    },
    take: limit,
  });

  // Get unique users
  const uniqueUsers = await prisma.telemetryEvent.findMany({
    where: {
      ...where,
      userId: { not: null },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  // Get unique sessions
  const uniqueSessions = await prisma.telemetryEvent.findMany({
    where: {
      ...where,
      sessionId: { not: null },
    },
    select: { sessionId: true },
    distinct: ['sessionId'],
  });

  // Get most visited pages
  const topPages = await prisma.telemetryEvent.groupBy({
    by: ['path'],
    where: {
      ...where,
      eventType: 'PAGE_VIEW',
      path: { not: null },
    },
    _count: true,
    orderBy: {
      _count: {
        path: 'desc',
      },
    },
    take: 10,
  });

  return {
    totalEvents: eventCounts.reduce((sum, item) => sum + item._count, 0),
    uniqueUsers: uniqueUsers.length,
    uniqueSessions: uniqueSessions.length,
    eventCounts,
    topPages,
  };
}

/**
 * Clean up old telemetry data (run periodically)
 */
export async function cleanupOldTelemetry(daysToKeep: number = 90): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.telemetryEvent.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  console.log(`🧹 Cleaned up ${result.count} telemetry events older than ${daysToKeep} days`);
}
