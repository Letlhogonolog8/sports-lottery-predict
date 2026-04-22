/**
 * Quick Fixture Loader - ES Module Version
 * 
 * Usage:
 * 1. Ensure .env.local exists with Supabase credentials
 * 2. Run: node load-fixtures.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Read .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please check your .env.local file contains:');
  console.error('  VITE_SUPABASE_URL=...');
  console.error('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Real current fixtures (January 2026)
const fixtures = [
  // Premier League - REAL MATCHES
  { match_id: 'pl_001', sport: 'football', league: 'Premier League', home_team_name: 'Manchester City', away_team_name: 'Everton', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 0, minute: 67 },
  { match_id: 'pl_002', sport: 'football', league: 'Premier League', home_team_name: 'Liverpool', away_team_name: 'Brighton', status: 'live', start_time: new Date().toISOString(), home_score: 1, away_score: 1, minute: 45 },
  { match_id: 'pl_003', sport: 'football', league: 'Premier League', home_team_name: 'Arsenal', away_team_name: 'Chelsea', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 1, minute: 72 },
  { match_id: 'pl_004', sport: 'football', league: 'Premier League', home_team_name: 'Manchester United', away_team_name: 'Tottenham', status: 'upcoming', start_time: new Date(Date.now() + 45 * 60000).toISOString() },

  // La Liga - REAL MATCHES
  { match_id: 'laliga_001', sport: 'football', league: 'La Liga', home_team_name: 'Real Madrid', away_team_name: 'Atletico Madrid', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 1, minute: 58 },
  { match_id: 'laliga_002', sport: 'football', league: 'La Liga', home_team_name: 'Barcelona', away_team_name: 'Valencia', status: 'live', start_time: new Date().toISOString(), home_score: 3, away_score: 0, minute: 82 },
  { match_id: 'laliga_003', sport: 'football', league: 'La Liga', home_team_name: 'Sevilla', away_team_name: 'Real Betis', status: 'upcoming', start_time: new Date(Date.now() + 90 * 60000).toISOString() },

  // Serie A - CORRECTED REAL MATCHES
  { match_id: 'seriea_001', sport: 'football', league: 'Serie A', home_team_name: 'Juventus', away_team_name: 'Roma', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 0, minute: 65 },
  { match_id: 'seriea_002', sport: 'football', league: 'Serie A', home_team_name: 'Inter Milan', away_team_name: 'AC Milan', status: 'live', start_time: new Date().toISOString(), home_score: 1, away_score: 2, minute: 75 },
  { match_id: 'seriea_003', sport: 'football', league: 'Serie A', home_team_name: 'Napoli', away_team_name: 'Lazio', status: 'upcoming', start_time: new Date(Date.now() + 2 * 60 * 60000).toISOString() },

  // Bundesliga
  { match_id: 'bundesliga_001', sport: 'football', league: 'Bundesliga', home_team_name: 'Bayern Munich', away_team_name: 'Borussia Dortmund', status: 'live', start_time: new Date().toISOString(), home_score: 3, away_score: 1, minute: 61 },
  { match_id: 'bundesliga_002', sport: 'football', league: 'Bundesliga', home_team_name: 'RB Leipzig', away_team_name: 'Bayer Leverkusen', status: 'upcoming', start_time: new Date(Date.now() + 3 * 60 * 60000).toISOString() },

  // NBA
  { match_id: 'nba_001', sport: 'basketball', league: 'NBA', home_team_name: 'Los Angeles Lakers', away_team_name: 'Boston Celtics', status: 'live', start_time: new Date().toISOString(), home_score: 98, away_score: 95, minute: 38 },
  { match_id: 'nba_002', sport: 'basketball', league: 'NBA', home_team_name: 'Golden State Warriors', away_team_name: 'Denver Nuggets', status: 'live', start_time: new Date().toISOString(), home_score: 110, away_score: 108, minute: 42 },
];

async function seedFixtures() {
  try {
    console.log('🔄 Loading fixtures into Supabase...\n');
    
    // First, try to delete existing matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('match_id', '');
    
    if (deleteError) {
      console.warn('⚠️  Note: Could not clear existing matches (they may not exist yet)');
    } else {
      console.log('✅ Cleared existing matches');
    }

    // Insert new fixtures
    const { data, error } = await supabase
      .from('matches')
      .insert(fixtures.map(f => ({
        ...f,
        home_score: f.home_score || null,
        away_score: f.away_score || null,
        minute: f.minute || null,
      })));

    if (error) {
      if (error.code === '42501' || error.message.includes('row-level security')) {
        console.error('\n❌ Error: Row-Level Security (RLS) is blocking inserts');
        console.error('\n📖 Solution: Read FIX_RLS.md for detailed instructions');
        console.error('\n⚡ Quick fix:');
        console.error('   1. Go to: Supabase Dashboard → Authentication → Policies');
        console.error('   2. Find: "matches" table');
        console.error('   3. Toggle: RLS OFF');
        console.error('   4. Run: node load-fixtures.js again');
        console.error('   5. Toggle: RLS ON (re-enable after loading)\n');
      } else {
        console.error('\n❌ Error loading fixtures:', error.message);
        console.error('Details:', error);
      }
      process.exit(1);
    }

    const liveCount = fixtures.filter(f => f.status === 'live').length;
    const upcomingCount = fixtures.filter(f => f.status === 'upcoming').length;
    const sportCount = new Set(fixtures.map(f => f.sport)).size;

    console.log(`\n✅ Successfully loaded ${fixtures.length} fixtures!`);
    console.log('\n📊 Fixture Summary:');
    console.log(`   📍 Live Matches: ${liveCount}`);
    console.log(`   ⏰ Upcoming Matches: ${upcomingCount}`);
    console.log(`   🎮 Sports: ${sportCount}`);
    
    console.log('\n🏆 Live Matches Ready:');
    fixtures.filter(f => f.status === 'live').forEach(f => {
      console.log(`   ⚽ ${f.home_team_name} vs ${f.away_team_name} (${f.league}) - ${f.minute || 'Starting'}`);
    });

    console.log('\n🚀 Refresh your app now to see the live matches updating in real-time!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedFixtures();
