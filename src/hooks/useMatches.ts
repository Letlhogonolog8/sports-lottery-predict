import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getLiveMatches,
  getUpcomingMatches,
  getMatchById,
  subscribeToLiveMatches,
  subscribeToMatchUpdates,
} from '@/lib/supabase';

export function useLiveMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getLiveMatches();
        setMatches(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch matches'));
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Subscribe to real-time updates
    const subscription = subscribeToLiveMatches((payload) => {
      if (payload.eventType === 'UPDATE') {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === payload.new.id ? { ...m, ...payload.new } : m
          )
        );
      }
      queryClient.invalidateQueries({ queryKey: ['liveMatches'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { matches, loading, error };
}

export function useUpcomingMatches(limit = 20) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getUpcomingMatches(limit);
        setMatches(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch matches'));
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [limit]);

  return { matches, loading, error };
}

export function useMatchSubscription(matchId: string) {
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getMatchById(matchId)
      .then((data) => {
        if (isMounted) setMatchData(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err : new Error('Failed to load match'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const subscription = subscribeToMatchUpdates(matchId, (payload) => {
      if (payload.eventType === 'UPDATE' && isMounted) {
        setMatchData((prev: any) => ({ ...prev, ...payload.new }));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [matchId]);

  return { matchData, loading, error };
}
