import { renameSync } from 'fs';
const fs = { renameSync };
const base = 'c:/Users/mudau/Desktop/New Apps/sports-lottery-predict/supabase/migrations/';
const renames = [
  ['003_fix_stats_trigger_and_rate_limits.sql', '_superseded_003_rate_limits_now_in_010.sql'],
  ['004_fix_match_status_drift.sql', '_superseded_004_status_drift_now_in_010.sql'],
  ['004_pg_cron_scheduler.sql', '011_pg_cron_scheduler.sql'],
  ['005_backfill_teams_and_link_matches.sql', '_superseded_005_now_in_010.sql'],
  ['006_supersport_scraped_teams.sql', '_superseded_006_now_in_010.sql'],
  ['007_supersport_football_basketball_teams.sql', '_superseded_007_now_in_010.sql'],
  ['008_cleanup_placeholder_demo_data.sql', '_superseded_008_now_in_010.sql'],
  ['009_recover_team_links_from_matches.sql', '_superseded_009_now_in_010.sql'],
];
renames.forEach(([oldName, newName]) => {
  try {
    fs.renameSync(base + oldName, base + newName);
    console.log('OK:', oldName, '->', newName);
  } catch (e) {
    console.error('FAIL:', oldName, e.message);
  }
});
