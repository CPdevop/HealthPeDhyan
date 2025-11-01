# 📊 Telemetry & Analytics System

Complete telemetry and analytics system for tracking user behavior, performance, and application usage.

---

## Overview

The telemetry system tracks:
- 📄 **Page Views** - Track which pages users visit
- 🖱️ **User Actions** - Button clicks, form submissions, interactions
- 🔌 **API Calls** - Track API usage and performance
- ❌ **Errors** - Capture and track errors
- ⚡ **Performance** - Monitor page load times and metrics
- 🎯 **Feature Usage** - Track specific feature adoption

---

## Architecture

### Database Schema

**Table:** `telemetry_events`

```sql
CREATE TABLE telemetry_events (
    id TEXT PRIMARY KEY,
    eventType "TelemetryEventType" NOT NULL,
    eventName TEXT NOT NULL,
    userId TEXT,
    sessionId TEXT,
    userAgent TEXT,
    ipAddress TEXT,
    path TEXT,
    referrer TEXT,
    properties JSONB,
    duration INTEGER,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Event Types:**
- `PAGE_VIEW` - Page navigation
- `USER_ACTION` - User interactions
- `API_CALL` - API requests
- `ERROR` - Error events
- `PERFORMANCE` - Performance metrics
- `FEATURE_USAGE` - Feature-specific tracking

---

## Usage

### Client-Side Tracking

Use the `useTelemetry()` hook in React components:

```typescript
import { useTelemetry } from '@/hooks/useTelemetry';

function MyComponent() {
  const { trackAction, trackFeature, trackError, trackPerformance } = useTelemetry();

  const handleButtonClick = () => {
    trackAction('button_click', {
      buttonName: 'submit_form',
      category: 'form',
    });
  };

  const handleFeatureUse = () => {
    trackFeature('label_scanner', 'upload', {
      fileSize: 12345,
      fileType: 'image/jpeg',
    });
  };

  return <button onClick={handleButtonClick}>Submit</button>;
}
```

**Automatic Tracking:**
- Page views are tracked automatically
- Page duration tracked on unmount
- Session ID persisted in localStorage

### Server-Side Tracking

Use telemetry functions directly:

```typescript
import {
  trackPageView,
  trackUserAction,
  trackApiCall,
  trackError,
  trackPerformance,
  trackFeatureUsage,
} from '@/lib/telemetry';

// Track API call
await trackApiCall({
  method: 'POST',
  endpoint: '/api/label-scan',
  statusCode: 200,
  duration: 1234,
  userId: user.id,
});

// Track feature usage
await trackFeatureUsage({
  feature: 'otp_login',
  action: 'verified',
  userId: user.id,
  properties: {
    provider: 'gmail',
  },
});

// Track error
await trackError({
  error: new Error('Something failed'),
  errorType: 'database_error',
  userId: user.id,
  path: '/api/products',
});
```

---

## Configuration

### Environment Variables

```env
# Enable/disable telemetry (default: true)
TELEMETRY_ENABLED=true

# Sampling rate 0.0-1.0 (default: 1.0 = 100%)
# Use 0.1 for 10% sampling to reduce data volume
TELEMETRY_SAMPLING_RATE=1.0
```

### Disable Telemetry

Set `TELEMETRY_ENABLED=false` in `.env` to completely disable tracking.

---

## Admin Dashboard

View analytics at: **`/admin/telemetry`**

**Features:**
- 📊 Total events, unique users, unique sessions
- 🏆 Most visited pages
- 📈 Event breakdown by type
- 🔍 Filter by event type and date range
- 📅 View last 24 hours, 7 days, 30 days, or 90 days

---

## API Endpoints

### POST /api/telemetry

Track events from client-side:

```typescript
await fetch('/api/telemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'USER_ACTION',
    eventName: 'button_click',
    userId: 'user_123',
    sessionId: 'sess_456',
    path: '/scan-label',
    properties: {
      button: 'upload',
      feature: 'label_scanner',
    },
  }),
});
```

### GET /api/telemetry/stats

Get aggregated statistics:

```typescript
// Last 7 days
const response = await fetch('/api/telemetry/stats?days=7');

// Filter by event type
const response = await fetch('/api/telemetry/stats?days=30&eventType=PAGE_VIEW');

const data = await response.json();
// {
//   totalEvents: 1234,
//   uniqueUsers: 56,
//   uniqueSessions: 89,
//   eventCounts: [...],
//   topPages: [...]
// }
```

---

## Common Tracking Patterns

### Track Form Submissions

```typescript
const { trackAction } = useTelemetry();

const handleSubmit = async (data) => {
  trackAction('form_submit', {
    formName: 'contact_form',
    fields: Object.keys(data),
  });

  // Submit form...
};
```

### Track Feature Adoption

```typescript
const { trackFeature } = useTelemetry();

// User uploads label
trackFeature('label_scanner', 'upload', {
  fileType: file.type,
  fileSize: file.size,
});

// User completes scan
trackFeature('label_scanner', 'complete', {
  healthScore: result.score,
  ingredientsFound: result.ingredients.length,
});
```

### Track Performance

```typescript
const { trackPerformance } = useTelemetry();

const startTime = Date.now();

// Perform operation
await loadProducts();

const duration = Date.now() - startTime;

trackPerformance('products_load', duration, {
  count: products.length,
});
```

### Track Errors

```typescript
const { trackError } = useTelemetry();

try {
  await riskyOperation();
} catch (error) {
  trackError(error as Error, {
    operation: 'risky_operation',
    retries: 3,
  });
  throw error;
}
```

---

## Data Retention & Cleanup

### Automatic Cleanup

Use the `cleanupOldTelemetry()` function to remove old data:

```typescript
import { cleanupOldTelemetry } from '@/lib/telemetry';

// Remove data older than 90 days
await cleanupOldTelemetry(90);
```

### Schedule Cleanup (Cron Job)

Create a cron job or scheduled task:

```bash
# Run daily at 2 AM
0 2 * * * pnpm tsx scripts/cleanup-telemetry.ts
```

**scripts/cleanup-telemetry.ts:**
```typescript
import { cleanupOldTelemetry } from '../src/lib/telemetry';

async function main() {
  await cleanupOldTelemetry(90); // Keep 90 days
  process.exit(0);
}

main().catch(console.error);
```

---

## Analytics Queries

### Get Statistics

```typescript
import { getTelemetryStats } from '@/lib/telemetry';

// Last 30 days
const stats = await getTelemetryStats({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  eventType: 'PAGE_VIEW',
  limit: 50,
});

console.log('Total events:', stats.totalEvents);
console.log('Unique users:', stats.uniqueUsers);
console.log('Top pages:', stats.topPages);
```

### Custom Queries

```typescript
import { prisma } from '@/lib/prisma';

// Get hourly page views
const hourlyViews = await prisma.telemetryEvent.groupBy({
  by: ['createdAt'],
  where: {
    eventType: 'PAGE_VIEW',
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  _count: true,
});

// Get most active users
const activeUsers = await prisma.telemetryEvent.groupBy({
  by: ['userId'],
  where: {
    userId: { not: null },
  },
  _count: true,
  orderBy: {
    _count: {
      userId: 'desc',
    },
  },
  take: 10,
});
```

---

## Privacy & Security

### Data Privacy

- ✅ No personally identifiable information (PII) stored
- ✅ IP addresses hashed for privacy
- ✅ User IDs are internal database IDs
- ✅ Session IDs generated client-side
- ✅ User agent strings for analytics only

### GDPR Compliance

To support GDPR "Right to be Forgotten":

```typescript
// Delete all telemetry for a user
await prisma.telemetryEvent.deleteMany({
  where: { userId: 'user_123' },
});
```

### Opt-Out

Allow users to opt-out by disabling telemetry in their settings:

```typescript
// Check user preference before tracking
if (user.telemetryEnabled !== false) {
  await trackEvent({ ... });
}
```

---

## Performance Considerations

### Sampling

For high-traffic sites, use sampling to reduce data volume:

```env
# Track only 10% of events
TELEMETRY_SAMPLING_RATE=0.1
```

### Async Tracking

All telemetry is tracked asynchronously and doesn't block:
- Client-side: Uses `setTimeout()` and `keepalive: true`
- Server-side: Fire-and-forget, errors logged but not thrown

### Database Indexes

All common query patterns are indexed:
- `eventType` - Filter by type
- `eventName` - Filter by name
- `userId` - Per-user analytics
- `sessionId` - Per-session analytics
- `createdAt` - Time-based queries
- `path` - Page-based analytics

---

## Migration

### Setup Telemetry Table

```bash
# Run migration
psql -U postgres -d healthpedhyan -f scripts/add-telemetry-table.sql
```

### Generate Prisma Client

```bash
pnpm db:generate
```

---

## Examples

### Track Label Scanner Usage

```typescript
// Upload
trackFeature('label_scanner', 'upload', {
  fileType: 'image/jpeg',
  fileSize: 123456,
});

// OCR complete
trackFeature('label_scanner', 'ocr_complete', {
  confidence: 85,
  extractedChars: 250,
});

// Analysis complete
trackFeature('label_scanner', 'analysis_complete', {
  healthScore: 65,
  ingredientsFound: 12,
  warnings: 3,
});
```

### Track Admin Actions

```typescript
// Product created
trackAction('admin_create_product', {
  productId: product.id,
  category: product.category,
  userId: session.user.id,
});

// Article published
trackAction('admin_publish_article', {
  articleId: article.id,
  wordCount: article.wordCount,
  userId: session.user.id,
});
```

---

## Troubleshooting

### Events Not Appearing

1. Check `TELEMETRY_ENABLED` is not false
2. Check sampling rate: `TELEMETRY_SAMPLING_RATE`
3. Check database connection
4. Check browser console for errors
5. Verify table exists: `\dt telemetry_events`

### High Data Volume

1. Reduce sampling rate: `TELEMETRY_SAMPLING_RATE=0.1`
2. Set up automatic cleanup
3. Archive old data to cold storage
4. Add indexes for common queries

---

## Roadmap

Future enhancements:
- 📊 Real-time dashboard with WebSockets
- 📈 Funnel analysis
- 👥 User cohort analysis
- 🎯 A/B testing integration
- 📧 Automated reports via email
- 🔔 Alerts for anomalies
- 📱 Mobile app tracking

---

**Happy Tracking!** 📊✨

HealthPeDhyan™ - Data-Driven Health Decisions
