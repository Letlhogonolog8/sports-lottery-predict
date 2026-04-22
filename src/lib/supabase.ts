import { createClient } from '@supabase/supabase-js';
import { retryWithBackoff } from './resilience';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'sports-lottery-predict',
    },
  },
});

// Auth functions
export async function signUp(email: string, password: string, username: string) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            email,
            username
          }
        ]);

      if (profileError) throw profileError;
    }

    return data;
  });
}

export async function signIn(email: string, password: string) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  });
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Prediction functions
export async function saveBetSlip(
  userId: string,
  matchId: string,
  predictionType: string,
  odds: number,
  stake?: number
) {
  const { data, error } = await supabase
    .from('bet_slips')
    .insert([
      {
        user_id: userId,
        match_id: matchId,
        prediction_type: predictionType,
        odds,
        stake,
        status: 'pending'
      }
    ])
    .select();

  if (error) throw error;
  return data;
}

export async function getUserBetSlips(userId: string, limit = 50) {
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
}

export async function getUserPredictionHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('prediction_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function savePredictionToHistory(
  userId: string,
  sport: string,
  teams: string,
  prediction: string,
  confidence: number,
  odds: number
) {
  const { data, error } = await supabase
    .from('prediction_history')
    .insert([
      {
        user_id: userId,
        sport,
        teams,
        prediction,
        confidence,
        odds,
        result: 'pending'
      }
    ])
    .select();

  if (error) throw error;
  return data;
}

// Match functions
export async function getLiveMatches() {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id (logo_url, name),
        away_team:teams!away_team_id (logo_url, name)
      `)
      .eq('status', 'live')
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  });
}

export async function getUpcomingMatches(limit = 20) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id (logo_url, name),
        away_team:teams!away_team_id (logo_url, name)
      `)
      .eq('status', 'upcoming')
      .gt('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  });
}

export async function getMatchPrediction(matchId: string) {
  const { data, error } = await supabase
    .from('match_predictions')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getMatchById(matchId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error) throw error;
  return data;
}

export async function getLatestMatchPredictions(matchIds: string[]) {
  if (!matchIds.length) return {};

  const { data, error } = await supabase
    .from('match_predictions')
    .select('match_id, home_win_probability, draw_probability, away_win_probability, confidence_score, created_at')
    .in('match_id', matchIds)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const latestByMatch: Record<string, {
    home_win_probability: number;
    draw_probability: number;
    away_win_probability: number;
    confidence_score: number;
  }> = {};

  for (const row of data || []) {
    if (!latestByMatch[row.match_id]) {
      latestByMatch[row.match_id] = {
        home_win_probability: row.home_win_probability,
        draw_probability: row.draw_probability,
        away_win_probability: row.away_win_probability,
        confidence_score: row.confidence_score,
      };
    }
  }

  return latestByMatch;
}

// Stats functions
export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('total_predictions, wins, losses, accuracy_percentage')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserStats(userId: string, stats: any) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(stats)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data;
}

// Platform statistics - calculated dynamically from database using COUNT aggregations.
// Previously fetched ALL settled bets (unbounded), causing timeouts at scale.
export async function getPlatformStats() {
  try {
    const now = new Date();
    const todayStartIso = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgoIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgoIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgoIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalSettled },
      { count: totalWins },
      { count: weekSettled },
      { count: weekWins },
      { count: activeLiveMatches },
      { count: todayPredictions },
      { count: activeUserCount },
      { data: monthlySettledBets },
      { data: topSportData },
    ] = await Promise.all([
      supabase
        .from('bet_slips')
        .select('id', { count: 'exact', head: true })
        .in('status', ['won', 'lost']),
      supabase
        .from('bet_slips')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'won'),
      supabase
        .from('bet_slips')
        .select('id', { count: 'exact', head: true })
        .in('status', ['won', 'lost'])
        .gte('settled_at', sevenDaysAgoIso),
      supabase
        .from('bet_slips')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'won')
        .gte('settled_at', sevenDaysAgoIso),
      supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live'),
      supabase
        .from('bet_slips')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartIso),
      supabase
        .from('bet_slips')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneDayAgoIso),
      supabase
        .from('bet_slips')
        .select('profit_loss, stake')
        .in('status', ['won', 'lost'])
        .gte('settled_at', thirtyDaysAgoIso)
        .limit(1000),
      supabase
        .from('bet_slips')
        .select('status, matches:match_id (sport)')
        .in('status', ['won', 'lost'])
        .not('match_id', 'is', null)
        .gte('settled_at', thirtyDaysAgoIso)
        .limit(500),
    ]);

    const total = totalSettled || 0;
    const wins = totalWins || 0;
    const accuracy = total ? (wins / total) * 100 : 0;

    const wkTotal = weekSettled || 0;
    const wkWins = weekWins || 0;
    const weeklyAccuracy = wkTotal ? (wkWins / wkTotal) * 100 : 0;

    const monthlyProfitValue = (monthlySettledBets || []).reduce(
      (sum: number, row: { profit_loss: number | null }) => sum + (Number(row.profit_loss) || 0), 0
    );
    const monthlyStakeValue = (monthlySettledBets || []).reduce(
      (sum: number, row: { stake: number | null }) => sum + (Number(row.stake) || 0), 0
    );
    const monthlyRoi = monthlyStakeValue > 0 ? (monthlyProfitValue / monthlyStakeValue) * 100 : 0;

    const sportAgg: Record<string, { wins: number; total: number }> = {};
    for (const row of topSportData || []) {
      const sport = (row.matches as { sport?: string } | null)?.sport || 'unknown';
      if (!sportAgg[sport]) sportAgg[sport] = { wins: 0, total: 0 };
      sportAgg[sport].total += 1;
      if (row.status === 'won') sportAgg[sport].wins += 1;
    }

    const topSportEntry = Object.entries(sportAgg)
      .filter(([, v]) => v.total > 0)
      .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];

    return {
      totalPredictions: total,
      accuracy: parseFloat(accuracy.toFixed(1)),
      activeLiveMatches: activeLiveMatches || 0,
      usersOnline: activeUserCount || 0,
      todayPredictions: todayPredictions || 0,
      weeklyAccuracy: parseFloat(weeklyAccuracy.toFixed(1)),
      monthlyProfit: `${monthlyRoi >= 0 ? '+' : ''}${monthlyRoi.toFixed(1)}%`,
      topSport: topSportEntry ? topSportEntry[0] : 'N/A',
    };
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return {
      totalPredictions: 0,
      accuracy: 0,
      activeLiveMatches: 0,
      usersOnline: 0,
      todayPredictions: 0,
      weeklyAccuracy: 0,
      monthlyProfit: '0.0%',
      topSport: 'N/A',
    };
  }
}

// Real-time subscriptions
export function subscribeToMatchUpdates(matchId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}

export function subscribeToUserBetSlips(userId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`user:${userId}:bet_slips`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bet_slips',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}

export function subscribeToLiveMatches(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('live_matches')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: 'status=eq.live',
      },
      callback
    )
    .subscribe();

  return subscription;
}

// Edge function calls
export async function predictMatch(matchData: any) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.functions.invoke('predict-match', {
      body: matchData
    });

    if (error) throw error;
    return data;
  }, 2, 2000); // Only 2 retries for predictions with 2s base delay
}

export async function fetchSportsData() {
  const { data, error } = await supabase.functions.invoke('fetch-sports-data');

  if (error) throw error;
  return data;
}

// Lottery functions
export async function getLotteryDraws() {
  const { data, error } = await supabase
    .from('lottery_draws')
    .select('*')
    .order('next_draw', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLotteryDrawWithDetails(drawId: string) {
  const { data: draw, error: drawError } = await supabase
    .from('lottery_draws')
    .select(`
      *,
      lottery_frequency (*),
      lottery_numbers (*)
    `)
    .eq('id', drawId)
    .single();

  if (drawError) throw drawError;

  const freq: Array<{ number: number; frequency: number }> = draw.lottery_frequency || [];
  const nums: Array<{ number: number; classification: string }> = draw.lottery_numbers || [];

  return {
    id: draw.id,
    name: draw.name,
    nextDraw: draw.next_draw,
    jackpot: draw.jackpot,
    numbersRange: [draw.numbers_range_min, draw.numbers_range_max] as [number, number],
    pickCount: draw.pick_count,
    frequencyData: freq
      .sort((a, b) => a.number - b.number)
      .map(f => ({ number: f.number, frequency: f.frequency })),
    hotNumbers: nums.filter(n => n.classification === 'hot').map(n => n.number),
    coldNumbers: nums.filter(n => n.classification === 'cold').map(n => n.number),
  };
}

export async function getAllLotteryDrawsWithDetails() {
  const { data: draws, error } = await supabase
    .from('lottery_draws')
    .select(`
      *,
      lottery_frequency (*),
      lottery_numbers (*)
    `)
    .order('next_draw', { ascending: true });

  if (error) throw error;

  return (draws || []).map(draw => {
    const freq: Array<{ number: number; frequency: number }> = draw.lottery_frequency || [];
    const nums: Array<{ number: number; classification: string }> = draw.lottery_numbers || [];
    return {
      id: draw.id,
      name: draw.name,
      nextDraw: draw.next_draw,
      jackpot: draw.jackpot,
      numbersRange: [draw.numbers_range_min, draw.numbers_range_max] as [number, number],
      pickCount: draw.pick_count,
      frequencyData: freq
        .sort((a, b) => a.number - b.number)
        .map(f => ({ number: f.number, frequency: f.frequency })),
      hotNumbers: nums.filter(n => n.classification === 'hot').map(n => n.number),
      coldNumbers: nums.filter(n => n.classification === 'cold').map(n => n.number),
    };
  });
}
