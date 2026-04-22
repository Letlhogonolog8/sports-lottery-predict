#!/usr/bin/env node
/**
 * Direct SofaScore Fetcher for Windows
 * =====================================
 * 
 * This script fetches real sports data from SofaScore API directly
 * (doesn't require Python - works on Windows)
 * 
 * Usage:
 * node fetch-sofascore.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env vars
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl, supabaseKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value;
        if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value;
      }
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch from SofaScore API directly
 * Works on Windows without Python!
 */
async function fetchSofaScore() {
  console.log('\n🌟 Fetching from SofaScore (Direct API)...\n');
  
  const sports = ['football', 'basketball'];
  const allMatches = [];

  for (const sport of sports) {
    try {
      console.log(`  🔄 Fetching ${sport}...`);
      
      const response = await fetch(
        `https://api.sofascore.com/api/v1/sport/${sport}/events/last`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const events = data.events || [];

      if (events.length === 0) {
        console.log(`     ⚠️  No ${sport} matches found`);
        continue;
      }

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

      allMatches.push(...matches);
      console.log(`     ✅ ${matches.length} ${sport} matches`);

    } catch (error) {
      console.error(`  ❌ ${sport} error:`, error.message);
    }
  }

  return allMatches;
}

/**
 * Load matches to database
 */
async function loadMatches(matches) {
  if (!matches || matches.length === 0) {
    console.log('\n⚠️ No matches to load');
    return false;
  }

  try {
    console.log(`\n📝 Loading ${matches.length} matches to Supabase...`);

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
    console.log(`   📊 ${matches.length} matches from ${new Set(matches.map(m => m.league)).size} leagues\n`);
    return true;
  } catch (error) {
    console.error('❌ Load error:', error.message);
    return false;
  }
}

/**
 * Fallback: Fetch from TheSportsDB (FREE, works reliably)
 */
async function fetchFromTheSportsDB() {
  try {
    console.log('  📌 Falling back to TheSportsDB (Free API)...\n');
    
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
            .filter(event => event.intHomeScore !== null && event.intAwayScore !== null)
            .map(event => ({
              match_id: `thesportsdb_${event.idEvent}`,
              sport: 'football',
              league: league,
              home_team_name: event.strHomeTeam,
              away_team_name: event.strAwayTeam,
              status: 'finished',
              start_time: new Date(event.dateEvent).toISOString(),
              home_score: parseInt(event.intHomeScore || 0),
              away_score: parseInt(event.intAwayScore || 0),
              minute: null,
            }));

          allMatches.push(...matches);
        }
      } catch (error) {
        console.warn(`    ⚠️  ${league}: ${error.message}`);
      }
    }

    return allMatches;
  } catch (error) {
    console.error('  ❌ TheSportsDB error:', error.message);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       🌟 Real Sports Data Fetcher (Windows Ready)          ║');
  console.log('║            SofaScore + Fallback Sources                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let matches = await fetchSofaScore();

  // Fallback to TheSportsDB if SofaScore returns nothing
  if (!matches || matches.length === 0) {
    matches = await fetchFromTheSportsDB();
  }

  if (matches && matches.length > 0) {
    const success = await loadMatches(matches);
    
    if (success) {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║  ✨ SUCCESS! Real matches loaded to Supabase              ║');
      console.log('║                                                            ║');
      console.log('║  Next:                                                     ║');
      console.log('║  1. Go to Supabase → Tables → matches → Data              ║');
      console.log('║  2. Run: npm run dev                                       ║');
      console.log('║  3. Open http://localhost:8080                            ║');
      console.log('║  4. Click "Browse Matches" - see REAL live sports! 🎉     ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
    }
  } else {
    console.log('\n⚠️ No matches found right now.');
    console.log('   Reasons: No live matches, API blocking, or time-based limits');
    console.log('   Try again in a few minutes when matches are scheduled.\n');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
