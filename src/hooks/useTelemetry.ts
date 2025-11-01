import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Generate or get session ID from localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('telemetry_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('telemetry_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Send telemetry event to API
 */
async function sendTelemetryEvent(data: {
  eventType: string;
  eventName: string;
  userId?: string;
  sessionId?: string;
  path?: string;
  referrer?: string;
  properties?: Record<string, any>;
  duration?: number;
}) {
  try {
    // Don't block user interactions
    setTimeout(async () => {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true, // Send even if page is closing
      });
    }, 0);
  } catch (error) {
    // Silently fail - don't break the app
    console.warn('Telemetry error:', error);
  }
}

/**
 * Hook for tracking telemetry events
 */
export function useTelemetry() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionId = useRef(getSessionId());
  const pageLoadTime = useRef(Date.now());

  const userId = session?.user?.id;

  /**
   * Track page view automatically
   */
  useEffect(() => {
    if (!pathname) return;

    const referrer = document.referrer || undefined;

    sendTelemetryEvent({
      eventType: 'PAGE_VIEW',
      eventName: `page_view:${pathname}`,
      userId,
      sessionId: sessionId.current,
      path: pathname,
      referrer,
    });

    // Reset page load time
    pageLoadTime.current = Date.now();

    // Track page unload (time spent on page)
    const handleUnload = () => {
      const duration = Date.now() - pageLoadTime.current;
      sendTelemetryEvent({
        eventType: 'PERFORMANCE',
        eventName: 'page_duration',
        userId,
        sessionId: sessionId.current,
        path: pathname,
        duration,
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname, userId]);

  /**
   * Track user action (button click, form submit, etc.)
   */
  const trackAction = useCallback(
    (action: string, properties?: Record<string, any>) => {
      sendTelemetryEvent({
        eventType: 'USER_ACTION',
        eventName: action,
        userId,
        sessionId: sessionId.current,
        path: pathname || undefined,
        properties,
      });
    },
    [pathname, userId]
  );

  /**
   * Track feature usage
   */
  const trackFeature = useCallback(
    (feature: string, action: string, properties?: Record<string, any>) => {
      sendTelemetryEvent({
        eventType: 'FEATURE_USAGE',
        eventName: `${feature}:${action}`,
        userId,
        sessionId: sessionId.current,
        path: pathname || undefined,
        properties,
      });
    },
    [pathname, userId]
  );

  /**
   * Track error
   */
  const trackError = useCallback(
    (error: Error, properties?: Record<string, any>) => {
      sendTelemetryEvent({
        eventType: 'ERROR',
        eventName: error.name || 'UnknownError',
        userId,
        sessionId: sessionId.current,
        path: pathname || undefined,
        properties: {
          message: error.message,
          stack: error.stack,
          ...properties,
        },
      });
    },
    [pathname, userId]
  );

  /**
   * Track performance metric
   */
  const trackPerformance = useCallback(
    (metric: string, value: number, properties?: Record<string, any>) => {
      sendTelemetryEvent({
        eventType: 'PERFORMANCE',
        eventName: `performance:${metric}`,
        userId,
        sessionId: sessionId.current,
        path: pathname || undefined,
        duration: value,
        properties,
      });
    },
    [pathname, userId]
  );

  return {
    trackAction,
    trackFeature,
    trackError,
    trackPerformance,
  };
}
