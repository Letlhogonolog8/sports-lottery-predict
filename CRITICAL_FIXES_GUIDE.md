# Critical Fixes Implementation Guide

## 🚨 IMMEDIATE ACTIONS (Week 1)

### Day 1: Security Hardening

#### 1. Secure API Keys
```bash
# Remove .env.local from git if committed
git rm --cached .env.local
echo ".env.local" >> .gitignore
git commit -m "Remove exposed API keys"

# Rotate all API keys
# 1. Generate new Supabase anon key
# 2. Generate new Google API key
# 3. Update .env.local with new keys
```

#### 2. Add Input Validation
```typescript
// Already created: src/lib/validation.ts
// Usage in components:

import { betSlipSchema, validateInput } from '@/lib/validation';

const handleSaveBet = async (data: unknown) => {
  const validation = validateInput(betSlipSchema, data);
  
  if (!validation.success) {
    toast({
      title: 'Validation Error',
      description: validation.errors.join(', '),
      variant: 'destructive'
    });
    return;
  }
  
  // Proceed with validated data
  await saveBetSlip(validation.data);
};
```

#### 3. Configure Security Headers
```typescript
// vite.config.ts - Add security headers
export default defineConfig({
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    }
  }
});
```

### Day 2: Error Handling

#### 1. Error Boundary (Already Created)
```typescript
// src/App.tsx - Already updated with ErrorBoundary
// Test it works:
// 1. Throw error in component
// 2. Verify fallback UI appears
// 3. Verify reload button works
```

#### 2. Add Retry Logic to API Calls
```typescript
// Replace direct supabase calls with optimized versions
// Example in MatchPredictionCard.tsx:

import { 
  getMatchPredictionOptimized, 
  predictMatchOptimized 
} from '@/lib/supabaseOptimized';

// Replace:
const prediction = await getMatchPrediction(matchId);
// With:
const prediction = await getMatchPredictionOptimized(matchId);
```

#### 3. Add Loading States
```typescript
// Add to all async operations
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  setError(null);
  await someAsyncOperation();
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
} finally {
  setLoading(false);
}
```

### Day 3: Monitoring Setup

#### 1. Install Sentry
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

#### 2. Update Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, { 
    contexts: { react: errorInfo } 
  });
}
```

#### 3. Add Performance Monitoring
```bash
npm install @vercel/analytics @vercel/speed-insights
```

```typescript
// src/App.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      {/* existing app code */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

### Day 4-5: Performance Optimization

#### 1. Add Code Splitting
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const PredictionHistory = lazy(() => import('@/pages/PredictionHistory'));
const Index = lazy(() => import('@/pages/Index'));

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/history" element={<PredictionHistory />} />
  </Routes>
</Suspense>
```

#### 2. Optimize React Query
```typescript
// src/App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});
```

#### 3. Add Memoization
```typescript
// src/components/AppLayout.tsx
import { useMemo, useCallback } from 'react';

// Memoize expensive computations
const filteredMatches = useMemo(() => {
  return matches.filter(match => {
    if (selectedSport !== 'all' && match.sport !== selectedSport) return false;
    if (selectedLeague !== 'all' && match.league !== selectedLeague) return false;
    return true;
  });
}, [matches, selectedSport, selectedLeague]);

// Memoize callbacks
const handleSelectPrediction = useCallback((matchId: string, prediction: string) => {
  // ... existing logic
}, [selectedPredictions]);
```

---

## 📊 DATABASE OPTIMIZATIONS

### Add Missing Indexes
```sql
-- Run in Supabase SQL Editor

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matches_sport_status_time 
ON matches(sport, status, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_bet_slips_user_status_created 
ON bet_slips(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prediction_history_user_result_settled 
ON prediction_history(user_id, result, settled_at DESC);

-- Partial indexes for active data
CREATE INDEX IF NOT EXISTS idx_matches_active 
ON matches(start_time DESC) 
WHERE status IN ('live', 'upcoming');

CREATE INDEX IF NOT EXISTS idx_bet_slips_pending 
ON bet_slips(user_id, created_at DESC) 
WHERE status = 'pending';
```

### Add Data Archival
```sql
-- Create archive table
CREATE TABLE IF NOT EXISTS matches_archive (
  LIKE matches INCLUDING ALL
);

-- Archive old matches (run monthly)
INSERT INTO matches_archive 
SELECT * FROM matches 
WHERE status = 'finished' 
AND start_time < NOW() - INTERVAL '90 days';

DELETE FROM matches 
WHERE status = 'finished' 
AND start_time < NOW() - INTERVAL '90 days';
```

---

## 🔧 CONFIGURATION UPDATES

### Update package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "@sentry/react": "^7.100.0",
    "@vercel/analytics": "^1.1.0",
    "@vercel/speed-insights": "^1.0.0"
  }
}
```

### Update vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
```

---

## 🧪 TESTING SETUP

### Install Testing Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Create Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Example Test
```typescript
// src/lib/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { betSlipSchema, validateInput } from '../validation';

describe('betSlipSchema', () => {
  it('validates correct bet slip data', () => {
    const data = {
      matchId: '123e4567-e89b-12d3-a456-426614174000',
      predictionType: 'home_win',
      odds: 2.5,
      stake: 10,
    };
    
    const result = validateInput(betSlipSchema, data);
    expect(result.success).toBe(true);
  });

  it('rejects invalid stake', () => {
    const data = {
      matchId: '123e4567-e89b-12d3-a456-426614174000',
      predictionType: 'home_win',
      odds: 2.5,
      stake: -10,
    };
    
    const result = validateInput(betSlipSchema, data);
    expect(result.success).toBe(false);
  });
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors in production build
- [ ] Bundle size < 500KB initial load
- [ ] Lighthouse score > 90
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Backup created

### Deployment Steps
```bash
# 1. Build production bundle
npm run build

# 2. Test production build locally
npm run preview

# 3. Deploy to Vercel
vercel --prod

# 4. Deploy edge functions
supabase functions deploy predict-match
supabase functions deploy fetch-sports-data
supabase functions deploy refresh-live-data

# 5. Verify deployment
curl https://your-domain.com/health
```

### Post-Deployment
- [ ] Monitor error rates in Sentry
- [ ] Check performance metrics
- [ ] Verify real-time updates working
- [ ] Test critical user flows
- [ ] Monitor database performance
- [ ] Check API rate limits

---

## 📈 MONITORING DASHBOARD

### Key Metrics to Track
```
1. Error Rate: < 0.1%
2. API Response Time (p95): < 300ms
3. Page Load Time (p95): < 3s
4. Database Query Time (p95): < 50ms
5. Prediction Generation Time: < 5s
6. Active Users: Real-time count
7. Cache Hit Rate: > 80%
8. Rate Limit Violations: < 10/hour
```

### Alerts to Configure
```
1. Error rate > 1% for 5 minutes
2. API response time > 1s for 5 minutes
3. Database connection pool exhausted
4. Edge function failures > 5% for 5 minutes
5. Disk space > 80%
6. Memory usage > 90%
```

---

## 🔄 ROLLBACK PROCEDURE

### If Issues Occur
```bash
# 1. Revert to previous deployment
vercel rollback

# 2. Revert database migrations if needed
supabase db reset

# 3. Notify users
# Post status update on status page

# 4. Investigate issue
# Check Sentry for errors
# Review logs in Vercel/Supabase

# 5. Fix and redeploy
# Apply fix
# Test thoroughly
# Deploy again
```

---

## 📞 SUPPORT CONTACTS

### Critical Issues
- Database: Supabase Support
- Hosting: Vercel Support
- AI API: Google Cloud Support
- Monitoring: Sentry Support

### Internal Team
- Lead Developer: [Contact]
- DevOps: [Contact]
- Security: [Contact]

---

## ✅ COMPLETION CHECKLIST

### Week 1 (Critical)
- [ ] API keys secured
- [ ] Input validation added
- [ ] Error boundary implemented
- [ ] Retry logic added
- [ ] Monitoring setup (Sentry)
- [ ] Security headers configured

### Week 2-3 (High Priority)
- [ ] Code splitting implemented
- [ ] Bundle size optimized
- [ ] Database indexes added
- [ ] Caching strategy implemented
- [ ] Rate limiting enforced
- [ ] Loading states added

### Week 4-6 (Medium Priority)
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests added
- [ ] E2E tests for critical flows
- [ ] Load testing completed
- [ ] Staging environment setup
- [ ] CI/CD pipeline created

### Week 7+ (Nice to Have)
- [ ] Accessibility improvements
- [ ] Mobile optimization
- [ ] Advanced analytics
- [ ] A/B testing framework
- [ ] Feature flags
- [ ] Documentation complete

---

**Last Updated:** January 2025  
**Next Review:** After Week 1 completion
