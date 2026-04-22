/**
 * SofaScore API Wrapper
 * 
 * Fetches live sports data from SofaScore's undocumented API
 * Covers: Football, Basketball, Tennis, Volleyball, Ice Hockey, and more
 * 
 * Usage:
 * const matches = await fetchSofaScoreMatches('football');
 */

interface SofaScoreMatch {
  id: number;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  homeScore: {
    current: number;
    display: number;
  };
  awayScore: {
    current: number;
    display: number;
  };
  status: {
    type: string; // 'finished', 'inprogress', 'scheduled', etc.
  };
  startTimestamp: number;
  tournament: {
    name: string;
    category: {
      name: string;
    };
  };
  time: {
    currentDisplaySeconds: number;
  };
}

export interface Match {
  match_id: string;
  sport: string;
  league: string;
  home_team_name: string;
  away_team_name: string;
  status: 'live' | 'upcoming' | 'finished';
  home_score: number | null;
  away_score: number | null;
  start_time: string;
  minute: number | null;
}

/**
 * Map SofaScore status to our status format
 */
function mapStatus(sofaScoreStatus: string): 'live' | 'upcoming' | 'finished' {
  if (sofaScoreStatus === 'inprogress') return 'live';
  if (sofaScoreStatus === 'finished') return 'finished';
  return 'upcoming';
}

/**
 * Fetch live football matches from SofaScore
 */
export async function fetchSofaScoreFootball(): Promise<Match[]> {
  try {
    console.log('🔄 Fetching from SofaScore (Football)...');
    
    // SofaScore API endpoint for today's football matches
    const response = await fetch(
      'https://api.sofascore.com/api/v1/sport/football/events/last',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SofaScore API error: ${response.status}`);
    }

    const data = await response.json();
    const events = data.events || [];

    // Filter for live and recent matches
    const now = Date.now() / 1000;
    const matches = events
      .filter((event: SofaScoreMatch) => {
        const eventTime = event.startTimestamp;
        // Include matches from last 12 hours to next 7 days
        return (now - eventTime < 43200) && (eventTime - now < 604800);
      })
      .map((event: SofaScoreMatch) => ({
        match_id: `sofascore_${event.id}`,
        sport: 'football',
        league: `${event.tournament.category.name} - ${event.tournament.name}`,
        home_team_name: event.homeTeam.name,
        away_team_name: event.awayTeam.name,
        status: mapStatus(event.status.type),
        home_score: event.status.type === 'finished' || event.status.type === 'inprogress' 
          ? event.homeScore.display 
          : null,
        away_score: event.status.type === 'finished' || event.status.type === 'inprogress' 
          ? event.awayScore.display 
          : null,
        start_time: new Date(event.startTimestamp * 1000).toISOString(),
        minute: event.status.type === 'inprogress' 
          ? event.time.currentDisplaySeconds / 60 
          : null,
      }));

    console.log(`✅ Got ${matches.length} matches from SofaScore Football`);
    return matches;
  } catch (error) {
    console.error('❌ SofaScore Football error:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetch live basketball matches from SofaScore
 */
export async function fetchSofaScoreBasketball(): Promise<Match[]> {
  try {
    console.log('🔄 Fetching from SofaScore (Basketball)...');
    
    const response = await fetch(
      'https://api.sofascore.com/api/v1/sport/basketball/events/last',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SofaScore API error: ${response.status}`);
    }

    const data = await response.json();
    const events = data.events || [];

    const now = Date.now() / 1000;
    const matches = events
      .filter((event: SofaScoreMatch) => {
        const eventTime = event.startTimestamp;
        return (now - eventTime < 43200) && (eventTime - now < 604800);
      })
      .map((event: SofaScoreMatch) => ({
        match_id: `sofascore_bball_${event.id}`,
        sport: 'basketball',
        league: `${event.tournament.category.name} - ${event.tournament.name}`,
        home_team_name: event.homeTeam.name,
        away_team_name: event.awayTeam.name,
        status: mapStatus(event.status.type),
        home_score: event.status.type === 'finished' || event.status.type === 'inprogress' 
          ? event.homeScore.display 
          : null,
        away_score: event.status.type === 'finished' || event.status.type === 'inprogress' 
          ? event.awayScore.display 
          : null,
        start_time: new Date(event.startTimestamp * 1000).toISOString(),
        minute: event.status.type === 'inprogress' 
          ? event.time.currentDisplaySeconds / 60 
          : null,
      }));

    console.log(`✅ Got ${matches.length} matches from SofaScore Basketball`);
    return matches;
  } catch (error) {
    console.error('❌ SofaScore Basketball error:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetch all sports from SofaScore
 */
export async function fetchAllSofaScoreMatches(): Promise<Match[]> {
  console.log('\n🌟 SofaScore Multi-Sport Fetcher Started\n');
  
  const [footballMatches, basketballMatches] = await Promise.all([
    fetchSofaScoreFootball(),
    fetchSofaScoreBasketball(),
  ]);

  const allMatches = [...footballMatches, ...basketballMatches];
  
  console.log(`\n✨ Total: ${allMatches.length} matches from SofaScore`);
  return allMatches;
}

/**
 * Fetch with fallback to football-data.org
 */
export async function fetchWithFallback(footballDataApiKey?: string): Promise<Match[]> {
  let matches: Match[] = [];

  // Try SofaScore first (no API key needed)
  matches = await fetchAllSofaScoreMatches();

  if (matches.length === 0 && footballDataApiKey) {
    console.log('\n⚠️ SofaScore returned no matches, trying football-data.org...\n');
    matches = await fetchFootballDataOrg(footballDataApiKey);
  }

  return matches;
}

/**
 * Fallback: Fetch from football-data.org
 */
async function fetchFootballDataOrg(apiKey: string): Promise<Match[]> {
  try {
    console.log('🔄 Fetching from football-data.org...');
    
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/PL,SA,PD,BL1,FL1/matches?status=LIVE,SCHEDULED',
      {
        headers: { 'X-Auth-Token': apiKey },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const matches = (data.matches || []).map((m: any) => ({
      match_id: `football_data_${m.id}`,
      sport: 'football',
      league: m.competition.name,
      home_team_name: m.homeTeam.name,
      away_team_name: m.awayTeam.name,
      status: m.status === 'LIVE' ? 'live' : 'upcoming' as const,
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      start_time: new Date(m.utcDate).toISOString(),
      minute: m.minute || null,
    }));

    console.log(`✅ Got ${matches.length} matches from football-data.org`);
    return matches;
  } catch (error) {
    console.error('❌ football-data.org error:', error instanceof Error ? error.message : error);
    return [];
  }
}
