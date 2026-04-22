-- ============================================
-- DATABASE OPTIMIZATION SCRIPTS
-- Run these in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADD MISSING INDEXES
-- ============================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_matches_sport_status_time 
ON public.matches(sport, status, start_time DESC)
WHERE status IN ('live', 'upcoming');

CREATE INDEX IF NOT EXISTS idx_bet_slips_user_status_created 
ON public.bet_slips(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prediction_history_user_result_settled 
ON public.prediction_history(user_id, result, settled_at DESC)
WHERE result IS NOT NULL;

-- Partial indexes for active data only
CREATE INDEX IF NOT EXISTS idx_matches_active 
ON public.matches(start_time DESC) 
WHERE status IN ('live', 'upcoming');

CREATE INDEX IF NOT EXISTS idx_bet_slips_pending 
ON public.bet_slips(user_id, created_at DESC) 
WHERE status = 'pending';

-- Index for match predictions lookup
CREATE INDEX IF NOT EXISTS idx_match_predictions_match_created 
ON public.match_predictions(match_id, created_at DESC);

-- Index for team lookups
CREATE INDEX IF NOT EXISTS idx_teams_sport_league 
ON public.teams(sport, league);

-- ============================================
-- 2. OPTIMIZE EXISTING QUERIES
-- ============================================

-- Create materialized view for platform stats (refresh every 5 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_stats_cache AS
SELECT 
  COUNT(*) FILTER (WHERE status IN ('won', 'lost')) as total_predictions,
  COUNT(*) FILTER (WHERE status = 'won') as total_wins,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'won')::numeric / 
     NULLIF(COUNT(*) FILTER (WHERE status IN ('won', 'lost')), 0) * 100)::numeric, 
    1
  ) as accuracy,
  COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as predictions_24h,
  NOW() as last_updated
FROM public.bet_slips;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_stats_cache_updated 
ON platform_stats_cache(last_updated);

-- Function to refresh stats cache
CREATE OR REPLACE FUNCTION refresh_platform_stats_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY platform_stats_cache;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. DATA ARCHIVAL STRATEGY
-- ============================================

-- Create archive tables
CREATE TABLE IF NOT EXISTS public.matches_archive (
  LIKE public.matches INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.bet_slips_archive (
  LIKE public.bet_slips INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.prediction_history_archive (
  LIKE public.prediction_history INCLUDING ALL
);

-- Function to archive old matches
CREATE OR REPLACE FUNCTION archive_old_matches()
RETURNS TABLE(archived_count bigint) AS $$
DECLARE
  archived_count bigint;
BEGIN
  -- Archive matches older than 90 days
  WITH archived AS (
    INSERT INTO public.matches_archive 
    SELECT * FROM public.matches 
    WHERE status = 'finished' 
    AND start_time < NOW() - INTERVAL '90 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Delete archived matches
  DELETE FROM public.matches 
  WHERE status = 'finished' 
  AND start_time < NOW() - INTERVAL '90 days';
  
  RETURN QUERY SELECT archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old bet slips
CREATE OR REPLACE FUNCTION archive_old_bet_slips()
RETURNS TABLE(archived_count bigint) AS $$
DECLARE
  archived_count bigint;
BEGIN
  -- Archive bet slips older than 180 days
  WITH archived AS (
    INSERT INTO public.bet_slips_archive 
    SELECT * FROM public.bet_slips 
    WHERE settled_at < NOW() - INTERVAL '180 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Delete archived bet slips
  DELETE FROM public.bet_slips 
  WHERE settled_at < NOW() - INTERVAL '180 days';
  
  RETURN QUERY SELECT archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. QUERY OPTIMIZATION FUNCTIONS
-- ============================================

-- Optimized function to get user bet slips with match details
CREATE OR REPLACE FUNCTION get_user_bet_slips_optimized(
  p_user_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  match_id UUID,
  prediction_type TEXT,
  odds DECIMAL,
  stake DECIMAL,
  status TEXT,
  profit_loss DECIMAL,
  created_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  home_team_name TEXT,
  away_team_name TEXT,
  match_status TEXT,
  home_score INT,
  away_score INT,
  start_time TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.id,
    bs.match_id,
    bs.prediction_type,
    bs.odds,
    bs.stake,
    bs.status,
    bs.profit_loss,
    bs.created_at,
    bs.settled_at,
    m.home_team_name,
    m.away_team_name,
    m.status as match_status,
    m.home_score,
    m.away_score,
    m.start_time
  FROM public.bet_slips bs
  INNER JOIN public.matches m ON bs.match_id = m.id
  WHERE bs.user_id = p_user_id
  ORDER BY bs.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 5. PERFORMANCE MONITORING
-- ============================================

-- Create table to track slow queries
CREATE TABLE IF NOT EXISTS public.slow_query_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT,
  execution_time_ms NUMERIC,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query(
  p_query_text TEXT,
  p_execution_time_ms NUMERIC,
  p_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  IF p_execution_time_ms > 1000 THEN -- Log queries slower than 1 second
    INSERT INTO public.slow_query_log (query_text, execution_time_ms, user_id)
    VALUES (p_query_text, p_execution_time_ms, p_user_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. VACUUM AND ANALYZE
-- ============================================

-- Run VACUUM ANALYZE on all tables (run weekly)
VACUUM ANALYZE public.matches;
VACUUM ANALYZE public.bet_slips;
VACUUM ANALYZE public.prediction_history;
VACUUM ANALYZE public.match_predictions;
VACUUM ANALYZE public.teams;
VACUUM ANALYZE public.team_stats;
VACUUM ANALYZE public.user_profiles;

-- ============================================
-- 7. TABLE PARTITIONING (For Large Datasets)
-- ============================================

-- Partition matches table by month (if > 1M rows)
-- Note: This requires recreating the table, backup first!

/*
-- Create partitioned table
CREATE TABLE public.matches_partitioned (
  LIKE public.matches INCLUDING ALL
) PARTITION BY RANGE (start_time);

-- Create partitions for each month
CREATE TABLE public.matches_2025_01 PARTITION OF public.matches_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE public.matches_2025_02 PARTITION OF public.matches_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Add more partitions as needed...

-- Migrate data (after backing up!)
INSERT INTO public.matches_partitioned SELECT * FROM public.matches;

-- Rename tables
ALTER TABLE public.matches RENAME TO matches_old;
ALTER TABLE public.matches_partitioned RENAME TO matches;
*/

-- ============================================
-- 8. CONNECTION POOLING CONFIGURATION
-- ============================================

-- Check current connection settings
SELECT name, setting, unit, short_desc 
FROM pg_settings 
WHERE name IN (
  'max_connections',
  'shared_buffers',
  'effective_cache_size',
  'maintenance_work_mem',
  'checkpoint_completion_target',
  'wal_buffers',
  'default_statistics_target',
  'random_page_cost',
  'effective_io_concurrency',
  'work_mem',
  'min_wal_size',
  'max_wal_size'
);

-- ============================================
-- 9. QUERY PERFORMANCE ANALYSIS
-- ============================================

-- Find slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100 -- queries averaging > 100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Find tables with most sequential scans (need indexes)
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 20;

-- Find unused indexes (consider dropping)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- 10. SCHEDULED MAINTENANCE
-- ============================================

-- Create function to run all maintenance tasks
CREATE OR REPLACE FUNCTION run_maintenance()
RETURNS TABLE(task TEXT, status TEXT, details TEXT) AS $$
BEGIN
  -- Refresh stats cache
  RETURN QUERY SELECT 
    'Refresh Stats Cache'::TEXT, 
    'Success'::TEXT, 
    'Materialized view refreshed'::TEXT;
  PERFORM refresh_platform_stats_cache();
  
  -- Archive old data
  RETURN QUERY SELECT 
    'Archive Matches'::TEXT, 
    'Success'::TEXT, 
    'Archived ' || archived_count || ' matches'::TEXT
  FROM archive_old_matches();
  
  RETURN QUERY SELECT 
    'Archive Bet Slips'::TEXT, 
    'Success'::TEXT, 
    'Archived ' || archived_count || ' bet slips'::TEXT
  FROM archive_old_bet_slips();
  
  -- Vacuum analyze
  VACUUM ANALYZE public.matches;
  VACUUM ANALYZE public.bet_slips;
  VACUUM ANALYZE public.prediction_history;
  
  RETURN QUERY SELECT 
    'Vacuum Analyze'::TEXT, 
    'Success'::TEXT, 
    'Tables optimized'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. BACKUP VERIFICATION
-- ============================================

-- Check last backup time
SELECT 
  NOW() - pg_last_xact_replay_timestamp() AS replication_lag,
  pg_last_xact_replay_timestamp() AS last_replay_time;

-- ============================================
-- 12. EXECUTION INSTRUCTIONS
-- ============================================

/*
STEP 1: Run indexes (safe, no downtime)
  - Copy sections 1-2 and run in SQL editor

STEP 2: Test performance improvement
  - Run queries and check execution time
  - Use EXPLAIN ANALYZE to verify index usage

STEP 3: Set up archival (run monthly)
  - Copy section 3 and run
  - Schedule with pg_cron or external scheduler

STEP 4: Monitor performance (weekly)
  - Copy section 9 and run
  - Review slow queries and optimize

STEP 5: Run maintenance (weekly)
  - SELECT * FROM run_maintenance();

STEP 6: Consider partitioning (if > 1M rows)
  - Backup database first!
  - Copy section 7 and adapt to your needs
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- END OF OPTIMIZATION SCRIPTS
-- ============================================
