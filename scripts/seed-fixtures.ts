/**
 * Fixture Seeder Script
 * Run with: npx ts-node scripts/seed-fixtures.ts
 * 
 * This script loads real-time match fixtures into your Supabase database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fixtures = [
  // Premier League
  { match_id: 'pl_001', sport: 'football', league: 'Premier League', home_team_name: 'Manchester City', away_team_name: 'Brighton', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 1, minute: 65 },
  { match_id: 'pl_002', sport: 'football', league: 'Premier League', home_team_name: 'Arsenal', away_team_name: 'Tottenham', status: 'live', start_time: new Date().toISOString(), home_score: 1, away_score: 1, minute: 42 },
  { match_id: 'pl_003', sport: 'football', league: 'Premier League', home_team_name: 'Chelsea', away_team_name: 'Manchester United', status: 'live', start_time: new Date(Date.now() - 30 * 60000).toISOString(), home_score: 0, away_score: 2, minute: 78 },
  { match_id: 'pl_004', sport: 'football', league: 'Premier League', home_team_name: 'Liverpool', away_team_name: 'Aston Villa', status: 'upcoming', start_time: new Date(Date.now() + 45 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
  { match_id: 'pl_005', sport: 'football', league: 'Premier League', home_team_name: 'Newcastle', away_team_name: 'Fulham', status: 'upcoming', start_time: new Date(Date.now() + 90 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
  { match_id: 'pl_006', sport: 'football', league: 'Premier League', home_team_name: 'West Ham', away_team_name: 'Everton', status: 'upcoming', start_time: new Date(Date.now() + 2 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // La Liga
  { match_id: 'laliga_001', sport: 'football', league: 'La Liga', home_team_name: 'Real Madrid', away_team_name: 'Barcelona', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 2, minute: 55 },
  { match_id: 'laliga_002', sport: 'football', league: 'La Liga', home_team_name: 'Atletico Madrid', away_team_name: 'Valencia', status: 'live', start_time: new Date(Date.now() - 15 * 60000).toISOString(), home_score: 1, away_score: 0, minute: 88 },
  { match_id: 'laliga_003', sport: 'football', league: 'La Liga', home_team_name: 'Real Sociedad', away_team_name: 'Betis', status: 'upcoming', start_time: new Date(Date.now() + 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
  { match_id: 'laliga_004', sport: 'football', league: 'La Liga', home_team_name: 'Sevilla', away_team_name: 'Villarreal', status: 'upcoming', start_time: new Date(Date.now() + 3 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // Serie A
  { match_id: 'seriea_001', sport: 'football', league: 'Serie A', home_team_name: 'Juventus', away_team_name: 'Inter Milan', status: 'live', start_time: new Date().toISOString(), home_score: 1, away_score: 1, minute: 72 },
  { match_id: 'seriea_002', sport: 'football', league: 'Serie A', home_team_name: 'AC Milan', away_team_name: 'Roma', status: 'live', start_time: new Date(Date.now() - 45 * 60000).toISOString(), home_score: 2, away_score: 0, minute: 90 },
  { match_id: 'seriea_003', sport: 'football', league: 'Serie A', home_team_name: 'Napoli', away_team_name: 'Lazio', status: 'upcoming', start_time: new Date(Date.now() + 2 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // Bundesliga
  { match_id: 'bundesliga_001', sport: 'football', league: 'Bundesliga', home_team_name: 'Bayern Munich', away_team_name: 'Borussia Dortmund', status: 'live', start_time: new Date().toISOString(), home_score: 3, away_score: 1, minute: 51 },
  { match_id: 'bundesliga_002', sport: 'football', league: 'Bundesliga', home_team_name: 'RB Leipzig', away_team_name: 'Union Berlin', status: 'upcoming', start_time: new Date(Date.now() + 90 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // Ligue 1
  { match_id: 'ligue1_001', sport: 'football', league: 'Ligue 1', home_team_name: 'Paris Saint-Germain', away_team_name: 'Marseille', status: 'live', start_time: new Date(Date.now() - 20 * 60000).toISOString(), home_score: 2, away_score: 1, minute: 85 },
  { match_id: 'ligue1_002', sport: 'football', league: 'Ligue 1', home_team_name: 'Lyon', away_team_name: 'Monaco', status: 'upcoming', start_time: new Date(Date.now() + 2.5 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // NBA
  { match_id: 'nba_001', sport: 'basketball', league: 'NBA', home_team_name: 'Los Angeles Lakers', away_team_name: 'Boston Celtics', status: 'live', start_time: new Date().toISOString(), home_score: 98, away_score: 95, minute: 38 },
  { match_id: 'nba_002', sport: 'basketball', league: 'NBA', home_team_name: 'Golden State Warriors', away_team_name: 'Denver Nuggets', status: 'live', start_time: new Date(Date.now() - 10 * 60000).toISOString(), home_score: 110, away_score: 108, minute: 42 },
  { match_id: 'nba_003', sport: 'basketball', league: 'NBA', home_team_name: 'Miami Heat', away_team_name: 'Chicago Bulls', status: 'upcoming', start_time: new Date(Date.now() + 3 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
  { match_id: 'nba_004', sport: 'basketball', league: 'NBA', home_team_name: 'New York Knicks', away_team_name: 'Los Angeles Clippers', status: 'upcoming', start_time: new Date(Date.now() + 5 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // ATP Tennis
  { match_id: 'atp_001', sport: 'tennis', league: 'ATP', home_team_name: 'Novak Djokovic', away_team_name: 'Carlos Alcaraz', status: 'live', start_time: new Date().toISOString(), home_score: 2, away_score: 0, minute: null },
  { match_id: 'atp_002', sport: 'tennis', league: 'ATP', home_team_name: 'Jannik Sinner', away_team_name: 'Daniil Medvedev', status: 'live', start_time: new Date(Date.now() - 60 * 60000).toISOString(), home_score: 1, away_score: 2, minute: null },
  { match_id: 'atp_003', sport: 'tennis', league: 'ATP', home_team_name: 'Dominic Thiem', away_team_name: 'Casper Ruud', status: 'upcoming', start_time: new Date(Date.now() + 2 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // Cricket
  { match_id: 'cricket_001', sport: 'cricket', league: 'Test Match', home_team_name: 'India', away_team_name: 'England', status: 'live', start_time: new Date().toISOString(), home_score: 287, away_score: 156, minute: null },
  { match_id: 'cricket_002', sport: 'cricket', league: 'Test Match', home_team_name: 'Australia', away_team_name: 'Pakistan', status: 'upcoming', start_time: new Date(Date.now() + 6 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
  { match_id: 'cricket_003', sport: 'cricket', league: 'Test Match', home_team_name: 'West Indies', away_team_name: 'South Africa', status: 'upcoming', start_time: new Date(Date.now() + 12 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },

  // NFL
  { match_id: 'nfl_001', sport: 'american_football', league: 'NFL', home_team_name: 'New England Patriots', away_team_name: 'Kansas City Chiefs', status: 'upcoming', start_time: new Date(Date.now() + 4 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
  { match_id: 'nfl_002', sport: 'american_football', league: 'NFL', home_team_name: 'Dallas Cowboys', away_team_name: 'Green Bay Packers', status: 'upcoming', start_time: new Date(Date.now() + 8 * 60 * 60000).toISOString(), home_score: null, away_score: null, minute: null },
];

async function seedFixtures() {
  try {
    console.log('🔄 Seeding fixtures...');
    
    // Delete existing matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('match_id', '');
    
    if (deleteError) {
      console.warn('⚠️  Could not delete existing matches:', deleteError);
    } else {
      console.log('✅ Cleared existing matches');
    }

    // Insert new fixtures
    const { data, error } = await supabase
      .from('matches')
      .insert(fixtures)
      .select();

    if (error) {
      console.error('❌ Error inserting fixtures:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data?.length || fixtures.length} fixtures!`);
    console.log('\n📊 Fixtures loaded:');
    console.log(`   - ${fixtures.filter(f => f.status === 'live').length} LIVE matches`);
    console.log(`   - ${fixtures.filter(f => f.status === 'upcoming').length} UPCOMING matches`);
    console.log(`   - ${new Set(fixtures.map(f => f.sport)).size} sports`);
    console.log(`\n🚀 Refresh your app to see the matches!`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedFixtures();
