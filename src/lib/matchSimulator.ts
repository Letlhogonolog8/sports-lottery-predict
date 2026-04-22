/**
 * Match Simulator - Generates realistic live match updates
 * Used for demo purposes to simulate real-time match data
 */

import { supabase } from './supabase';

/**
 * Simulate match progression for a live match
 */
export async function simulateMatchUpdate(matchId: string): Promise<void> {
  try {
    // Get current match data
    const { data: match } = await supabase
      .from('matches')
      .select('id, status, minute, home_score, away_score')
      .eq('id', matchId)
      .single();

    if (!match || match.status !== 'live') return;

    const currentMinute = match.minute || 0;
    let newMinute = currentMinute + 1;
    let homeScore = match.home_score || 0;
    let awayScore = match.away_score || 0;
    let newStatus = 'live';

    // Match ends at 90 minutes
    if (newMinute >= 90) {
      newMinute = 90;
      newStatus = 'finished';
    }

    // Randomly simulate goals (5% chance per minute)
    if (Math.random() < 0.05) {
      if (Math.random() < 0.5) {
        homeScore += 1;
      } else {
        awayScore += 1;
      }
    }

    // Update match
    await supabase
      .from('matches')
      .update({
        minute: newMinute,
        home_score: homeScore,
        away_score: awayScore,
        status: newStatus,
      })
      .eq('id', matchId);

  } catch (error) {
    console.error(`Error updating match ${matchId}:`, error);
  }
}

/**
 * Start simulation for all live matches
 * Simulates match progression every 30 seconds
 */
export function startLiveMatchSimulation(): ReturnType<typeof setInterval> {
  const interval = setInterval(async () => {
    try {
      // Get all live matches
      const { data: liveMatches } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'live');

      if (liveMatches) {
        // Update each live match
        for (const match of liveMatches) {
          await simulateMatchUpdate(match.id);
        }
      }
    } catch (error) {
      console.error('Error in match simulation:', error);
    }
  }, 30000); // Update every 30 seconds

  return interval;
}

/**
 * Progress upcoming matches to live when their start time arrives
 */
export async function promoteUpcomingToLive(): Promise<void> {
  try {
    const now = new Date();

    await supabase
      .from('matches')
      .update({
        status: 'live',
        minute: 0,
      })
      .eq('status', 'upcoming')
      .lte('start_time', now.toISOString());

  } catch (error) {
    console.error('Error promoting upcoming matches:', error);
  }
}

/**
 * Generate realistic prediction data for a match
 */
export function generatePrediction(homeTeam: string, awayTeam: string) {
  // Simulate some predictability based on team names
  const homeOdds = 1.5 + Math.random() * 2.5;
  const drawOdds = 2.5 + Math.random() * 2;
  const awayOdds = 1.5 + Math.random() * 3.5;

  // Normalize to percentages
  const total = homeOdds + drawOdds + awayOdds;
  const homeWin = Math.round((homeOdds / total) * 100);
  const draw = Math.round((drawOdds / total) * 100);
  const awayWin = 100 - homeWin - draw;

  return {
    homeWin,
    draw,
    awayWin,
    confidence: 60 + Math.round(Math.random() * 30),
  };
}

/**
 * Generate realistic odds for a match
 */
export function generateOdds(homeTeam: string, awayTeam: string) {
  return {
    homeWin: 1.5 + Math.random() * 2,
    draw: 2.5 + Math.random() * 1.5,
    awayWin: 2 + Math.random() * 3,
  };
}

/**
 * Get simulated match momentum
 */
export function calculateMomentum(
  homeScore: number,
  awayScore: number,
  minute: number
): 'home' | 'away' | 'neutral' {
  const scoreDiff = homeScore - awayScore;

  if (scoreDiff > 0) return 'home';
  if (scoreDiff < 0) return 'away';
  return 'neutral';
}

/**
 * Generate simulated key stats for a live match
 */
export function generateKeyStats() {
  const possession = [
    Math.round(40 + Math.random() * 20),
    Math.round(40 + Math.random() * 20),
  ];
  // Normalize possession
  const total = possession[0] + possession[1];
  possession[0] = Math.round((possession[0] / total) * 100);
  possession[1] = 100 - possession[0];

  return {
    possession: possession as [number, number],
    shots: [Math.round(5 + Math.random() * 10), Math.round(5 + Math.random() * 10)] as [number, number],
    shotsOnTarget: [Math.round(2 + Math.random() * 5), Math.round(2 + Math.random() * 5)] as [number, number],
    corners: [Math.round(2 + Math.random() * 8), Math.round(2 + Math.random() * 8)] as [number, number],
  };
}
