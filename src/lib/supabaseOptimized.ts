import { supabase } from './supabase';
import { retryWithBackoff, rateLimiter, requestDeduplicator } from './resilience';

// Cache configuration
const CACHE_TTL = {
  matches: 5 * 60 * 1000, // 5 minutes
  predictions: 24 * 60 * 60 * 1000, // 24 hours
  teams: 60 * 60 * 1000, // 1 hour
  stats: 10 * 60 * 1000, // 10 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number): void {
    this.store.set(key, { data, timestamp: Date.now() + ttl });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  invalidate(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

const cache = new Cache();

// Enhanced API wrapper with retry, rate limiting, and caching
export async function getLiveMatchesOptimized() {
  const cacheKey = 'live_matches';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.canMakeRequest('getLiveMatches', 10, 60000)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return requestDeduplicator.deduplicate(cacheKey, async () => {
    const data = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey (logo_url, name),
          away_team:teams!matches_away_team_id_fkey (logo_url, name)
        `)
        .eq('status', 'live')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    });

    cache.set(cacheKey, data, CACHE_TTL.matches);
    return data;
  });
}

export async function getUpcomingMatchesOptimized(limit = 20) {
  const cacheKey = `upcoming_matches_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.canMakeRequest('getUpcomingMatches', 10, 60000)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return requestDeduplicator.deduplicate(cacheKey, async () => {
    const data = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey (logo_url, name),
          away_team:teams!matches_away_team_id_fkey (logo_url, name)
        `)
        .eq('status', 'upcoming')
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    });

    cache.set(cacheKey, data, CACHE_TTL.matches);
    return data;
  });
}

export async function getMatchPredictionOptimized(matchId: string) {
  const cacheKey = `prediction_${matchId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.canMakeRequest('getMatchPrediction', 20, 60000)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return requestDeduplicator.deduplicate(cacheKey, async () => {
    const data = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    });

    if (data) {
      cache.set(cacheKey, data, CACHE_TTL.predictions);
    }
    return data;
  });
}

export async function predictMatchOptimized(matchData: any) {
  if (!rateLimiter.canMakeRequest('predictMatch', 5, 60000)) {
    const remaining = rateLimiter.getRemainingRequests('predictMatch', 5, 60000);
    throw new Error(`Rate limit exceeded. ${remaining} requests remaining. Please wait before generating more predictions.`);
  }

  return retryWithBackoff(async () => {
    const { data, error } = await supabase.functions.invoke('predict-match', {
      body: matchData,
    });

    if (error) throw error;
    
    // Invalidate prediction cache for this match
    cache.invalidate(`prediction_${matchData.matchId}`);
    
    return data;
  }, 2, 2000); // Only 2 retries for predictions
}

export async function saveBetSlipOptimized(
  userId: string,
  matchId: string,
  predictionType: string,
  odds: number,
  stake?: number
) {
  if (!rateLimiter.canMakeRequest('saveBetSlip', 20, 60000)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from('bet_slips')
      .insert([
        {
          user_id: userId,
          match_id: matchId,
          prediction_type: predictionType,
          odds,
          stake,
          status: 'pending',
        },
      ])
      .select();

    if (error) throw error;
    
    // Invalidate user bet slips cache
    cache.invalidate(`bet_slips_${userId}`);
    
    return data;
  });
}

export async function getUserBetSlipsOptimized(userId: string, limit = 50) {
  const cacheKey = `bet_slips_${userId}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.canMakeRequest('getUserBetSlips', 20, 60000)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return requestDeduplicator.deduplicate(cacheKey, async () => {
    const data = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('bet_slips')
        .select(`
          *,
          matches:match_id (
            home_team_name,
            away_team_name,
            status,
            home_score,
            away_score,
            start_time
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    });

    cache.set(cacheKey, data, CACHE_TTL.stats);
    return data;
  });
}

export async function getPlatformStatsOptimized() {
  const cacheKey = 'platform_stats';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.canMakeRequest('getPlatformStats', 10, 60000)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return requestDeduplicator.deduplicate(cacheKey, async () => {
    const data = await retryWithBackoff(async () => {
      // Use the existing getPlatformStats function from supabase.ts
      const { getPlatformStats } = await import('./supabase');
      return getPlatformStats();
    });

    cache.set(cacheKey, data, CACHE_TTL.stats);
    return data;
  });
}

// Cache management utilities
export function invalidateCache(pattern?: string) {
  if (pattern) {
    cache.invalidate(pattern);
  } else {
    cache.clear();
  }
}

export function getCacheStats() {
  return {
    rateLimits: {
      getLiveMatches: rateLimiter.getRemainingRequests('getLiveMatches', 10, 60000),
      getUpcomingMatches: rateLimiter.getRemainingRequests('getUpcomingMatches', 10, 60000),
      predictMatch: rateLimiter.getRemainingRequests('predictMatch', 5, 60000),
      saveBetSlip: rateLimiter.getRemainingRequests('saveBetSlip', 20, 60000),
    },
  };
}
