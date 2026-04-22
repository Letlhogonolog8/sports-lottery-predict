/**
 * Fetch REAL live matches from sports APIs
 * Automatically gets current matches without manual intervention
 */

import { supabase } from './supabase';

/**
 * Fetch from TheSportsDB (FREE - No API key needed)
 * Returns real match data for multiple leagues
 */
export async function fetchFromTheSportsDB() {
  try {
    console.log('🔄 Fetching real matches from TheSportsDB...');
    
    // Get today's matches - This is a real API endpoint
    const today = new Date().toISOString().split('T')[0];
    
    // TheSportsDB - Free endpoint for daily events
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?id=133602&d=${today}`
    );
    
    if (!response.ok) throw new Error('TheSportsDB API error');
    
    const data = await response.json();
    
    if (!data.results) {
      console.log('⚠️ No matches found for today');
      return [];
    }

    // Transform to our format
    const matches = data.results.map((event: any) => ({
      match_id: event.idEvent,
      sport: 'football',
      league: event.strLeague || 'Unknown',
      home_team_name: event.strHomeTeam,
      away_team_name: event.strAwayTeam,
      status: event.intHomeScore !== null ? 'live' : 'upcoming',
      start_time: new Date(event.dateEvent).toISOString(),
      home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
      away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
    }));

    console.log(`✅ Got ${matches.length} real matches from TheSportsDB`);
    return matches;
  } catch (error) {
    console.error('❌ TheSportsDB fetch error:', error);
    return [];
  }
}

/**
 * Fetch from API-Football (requires API key, but more reliable)
 * Sign up free at: https://www.api-football.com/
 */
export async function fetchFromAPIFootball(apiKey: string) {
  try {
    if (!apiKey) {
      console.log('⚠️ API-Football key not provided, skipping...');
      return [];
    }

    console.log('🔄 Fetching real matches from API-Football...');

    const response = await fetch(
      'https://v3.football.api-sports.io/fixtures?live=all',
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    );

    if (!response.ok) throw new Error('API-Football error');

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.log('⚠️ No live matches found');
      return [];
    }

    // Transform to our format
    const matches = data.response.map((fixture: any) => ({
      match_id: `api_football_${fixture.fixture.id}`,
      sport: 'football',
      league: fixture.league.name,
      home_team_name: fixture.teams.home.name,
      away_team_name: fixture.teams.away.name,
      status: fixture.fixture.status.short === 'LIVE' ? 'live' : 'upcoming',
      start_time: new Date(fixture.fixture.date).toISOString(),
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
      minute: fixture.fixture.status.elapsed || null,
    }));

    console.log(`✅ Got ${matches.length} real matches from API-Football`);
    return matches;
  } catch (error) {
    console.error('❌ API-Football fetch error:', error);
    return [];
  }
}

/**
 * Load real matches into Supabase
 */
export async function loadRealMatches(matches: any[]) {
  if (matches.length === 0) {
    console.log('⚠️ No matches to load');
    return;
  }

  try {
    console.log(`📝 Loading ${matches.length} matches to Supabase...`);

    // Clear old matches
    await supabase.from('matches').delete().neq('match_id', '');

    // Insert new matches
    const { error } = await supabase
      .from('matches')
      .insert(matches);

    if (error) {
      console.error('❌ Error loading matches:', error);
      return false;
    }

    console.log('✅ Matches loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Load error:', error);
    return false;
  }
}

/**
 * Main function - Automatically fetch and load REAL matches
 */
export async function autoFetchAndLoadMatches() {
  console.log('🚀 Starting automatic real match fetch...');

  // Try API-Football first (if key available)
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  let matches = await fetchFromAPIFootball(apiKey);

  // Fallback to TheSportsDB if API-Football fails
  if (matches.length === 0) {
    console.log('📌 Trying TheSportsDB as fallback...');
    matches = await fetchFromTheSportsDB();
  }

  // Load to database
  if (matches.length > 0) {
    await loadRealMatches(matches);
  } else {
    console.warn('⚠️ Could not fetch any real matches');
  }
}

/**
 * Schedule automatic updates every X minutes
 */
export function scheduleAutoUpdates(intervalMinutes = 5) {
  console.log(`📅 Scheduling real match updates every ${intervalMinutes} minutes`);

  // First update immediately
  autoFetchAndLoadMatches();

  // Then update on schedule
  setInterval(() => {
    console.log(`🔄 Auto-updating matches (${new Date().toLocaleTimeString()})`);
    autoFetchAndLoadMatches();
  }, intervalMinutes * 60 * 1000);
}
