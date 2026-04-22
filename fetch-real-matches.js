/**
 * Auto-Fetch Real Matches from Sports APIs
 * 
 * This script:
 * 1. Fetches REAL current live matches from SofaScore (PRIMARY)
 * 2. Falls back to API-Football or TheSportsDB if needed
 * 3. Loads them into Supabase automatically
 * 4. Runs on a schedule (every 5 minutes)
 * 5. No manual updates needed!
 * 
 * Priority: SofaScore → API-Football → TheSportsDB
 * 
 * Usage:
 * node fetch-real-matches.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env vars
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      process.env[key.trim()] = value;
    }
  }
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const footballApiKey = process.env.FOOTBALL_DATA_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch from SofaScore (NO API KEY NEEDED - Free!)
 * Covers: Football, Basketball, Tennis, Volleyball, Ice Hockey, etc.
 */
async function fetchFromSofaScore() {
  try {
    console.log('\n🌟 Fetching from SofaScore (Multi-Sport)...');
    
    const [footballMatches, basketballMatches] = await Promise.all([
      fetchSofaScoreSport('football'),
      fetchSofaScoreSport('basketball'),
    ]);

    const allMatches = [...footballMatches, ...basketballMatches];
    
    if (allMatches.length > 0) {
      console.log(`✅ Got ${allMatches.length} total matches from SofaScore`);
      console.log(`   🏀 Football: ${footballMatches.length}, Basketball: ${basketballMatches.length}`);
    } else {
      console.log('⚠️ No matches found on SofaScore');
    }
    
    return allMatches;
  } catch (error) {
    console.error('❌ SofaScore error:', error.message);
    return [];
  }
}

/**
 * Helper: Fetch specific sport from SofaScore
 */
async function fetchSofaScoreSport(sport) {
  try {
    const sportMap = {
      football: 'football',
      basketball: 'basketball',
      tennis: 'tennis',
      volleyball: 'volleyball',
    };

    // Try multiple endpoints
    const endpoints = [
      `https://api.sofascore.com/api/v1/sport/${sportMap[sport]}/events/last`,
      `https://api.sofascore.com/api/v1/sport/${sportMap[sport]}/events/today`,
    ];

    let response;
    let lastError;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.sofascore.com/',
          },
        });

        if (response.ok) {
          break;
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error(`HTTP ${response?.status || 'unknown'}`);
    }

    const data = await response.json();
    const events = data.events || [];

    if (events.length === 0) return [];

    const now = Date.now() / 1000;
    const matches = events
      .filter(event => {
        const eventTime = event.startTimestamp;
        // Include matches from last 12 hours to next 7 days
        return (now - eventTime < 43200) && (eventTime - now < 604800);
      })
      .map(event => ({
        match_id: `sofascore_${sport}_${event.id}`,
        sport: sport,
        league: `${event.tournament.category.name} - ${event.tournament.name}`,
        home_team_name: event.homeTeam.name,
        away_team_name: event.awayTeam.name,
        status: event.status.type === 'inprogress' ? 'live' 
              : event.status.type === 'finished' ? 'finished'
              : 'upcoming',
        home_score: (event.status.type === 'finished' || event.status.type === 'inprogress') 
          ? event.homeScore.display 
          : null,
        away_score: (event.status.type === 'finished' || event.status.type === 'inprogress') 
          ? event.awayScore.display 
          : null,
        start_time: new Date(event.startTimestamp * 1000).toISOString(),
        minute: event.status.type === 'inprogress' 
          ? Math.floor(event.time.currentDisplaySeconds / 60)
          : null,
      }));

    return matches;
  } catch (error) {
    console.error(`⚠️ SofaScore ${sport} error:`, error.message);
    return [];
  }
}

/**
 * Fetch from API-Football (Best quality, paid but free tier available)
 */
async function fetchFromAPIFootball() {
  if (!footballApiKey) {
    console.log('⏭️ API-Football key not found, skipping...');
    return null;
  }

  try {
    console.log('🔄 Fetching from API-Football...');
    // Fetch LIVE + TODAY's matches (not just live)
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          'x-rapidapi-key': footballApiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.log('⚠️ No matches found for today');
      return [];
    }

    const matches = data.response
      .map(fixture => ({
        match_id: `apif_${fixture.fixture.id}`,
        sport: 'football',
        league: fixture.league.name,
        home_team_name: fixture.teams.home.name,
        away_team_name: fixture.teams.away.name,
        status: fixture.fixture.status.short === 'LIVE' ? 'live' : 'upcoming',
        start_time: new Date(fixture.fixture.date).toISOString(),
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        minute: fixture.fixture.status.elapsed || null,
      }))
      .filter(m => m.status === 'live' || (m.home_score !== null && m.away_score !== null) || m.start_time > new Date().toISOString());

    console.log(`✅ Got ${matches.length} matches from API-Football`);
    return matches;
  } catch (error) {
    console.error('❌ API-Football error:', error.message);
    return null;
  }
}

/**
 * Fetch from TheSportsDB (FREE - No API key needed)
 */
async function fetchFromTheSportsDB() {
  try {
    console.log('🔄 Fetching from TheSportsDB...');
    
    // Get multiple league IDs for today
    const leagues = {
      'Premier League': 133601,
      'La Liga': 133602,
      'Serie A': 133603,
      'Bundesliga': 133604,
      'Ligue 1': 133605,
    };

    const today = new Date().toISOString().split('T')[0];
    const allMatches = [];

    for (const [league, leagueId] of Object.entries(leagues)) {
      try {
        const response = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?id=${leagueId}&d=${today}`
        );

        if (!response.ok) continue;

        const data = await response.json();

        if (data.results) {
          const matches = data.results
            .filter(event => event.intHomeScore !== null) // Only live matches
            .map(event => ({
              match_id: `thesportsdb_${event.idEvent}`,
              sport: 'football',
              league: league,
              home_team_name: event.strHomeTeam,
              away_team_name: event.strAwayTeam,
              status: 'live',
              start_time: new Date(event.dateEvent).toISOString(),
              home_score: parseInt(event.intHomeScore || 0),
              away_score: parseInt(event.intAwayScore || 0),
              minute: null, // TheSportsDB doesn't provide minute
            }));

          allMatches.push(...matches);
        }
      } catch (error) {
        console.warn(`⚠️ Error fetching ${league}:`, error.message);
      }
    }

    console.log(`✅ Got ${allMatches.length} matches from TheSportsDB`);
    return allMatches;
  } catch (error) {
    console.error('❌ TheSportsDB error:', error.message);
    return null;
  }
}

/**
 * Load matches to Supabase
 */
async function loadMatches(matches) {
  if (!matches || matches.length === 0) {
    console.log('⚠️ No matches to load');
    return false;
  }

  try {
    console.log(`📝 Loading ${matches.length} real matches to Supabase...`);

    // Delete old matches
    await supabase.from('matches').delete().neq('match_id', '');

    // Insert new matches
    const { error } = await supabase
      .from('matches')
      .insert(matches.map(m => ({
        ...m,
        home_score: m.home_score || null,
        away_score: m.away_score || null,
        minute: m.minute || null,
      })));

    if (error) {
      console.error('❌ Error loading matches:', error.message);
      return false;
    }

    console.log('✅ Matches loaded successfully!');
    console.log(`   📊 ${matches.length} matches from ${new Set(matches.map(m => m.league)).size} leagues`);
    return true;
  } catch (error) {
    console.error('❌ Load error:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Real Match Auto-Fetcher Started');
  console.log('Priority: SofaScore → API-Football → TheSportsDB\n');

  // Try SofaScore first (FREE, NO API KEY)
  let matches = await fetchFromSofaScore();

  // Fallback to API-Football
  if (!matches || matches.length === 0) {
    console.log('\n📌 Falling back to API-Football...');
    matches = await fetchFromAPIFootball();
  }

  // Fallback to TheSportsDB
  if (!matches || matches.length === 0) {
    console.log('\n📌 Falling back to TheSportsDB...');
    matches = await fetchFromTheSportsDB();
  }

  // Load to database
  if (matches && matches.length > 0) {
    const success = await loadMatches(matches);
    
    if (success) {
      console.log('\n✨ Ready! Refresh your app to see REAL live matches.\n');
    }
  } else {
    console.log('\n⚠️ Could not fetch any real matches right now.');
    console.log('Try again in a few minutes when matches are available.\n');
  }
}

// Run once
main();

// Uncomment below to run on schedule (every 5 minutes)
// setInterval(main, 5 * 60 * 1000);
