WITH placeholder_matches AS (
  SELECT id
  FROM public.matches
  WHERE
    COALESCE(home_team_name, '') ILIKE '%test match%'
    OR COALESCE(away_team_name, '') ILIKE '%test match%'
    OR COALESCE(league, '') ILIKE '%test%'
    OR COALESCE(league, '') ILIKE '%demo%'
    OR COALESCE(match_id, '') ILIKE 'test_%'
    OR COALESCE(match_id, '') ILIKE 'demo_%'
    OR COALESCE(match_id, '') ILIKE '%_test_%'
    OR COALESCE(match_id, '') ILIKE '%_demo_%'
)
DELETE FROM public.matches
WHERE id IN (SELECT id FROM placeholder_matches);

WITH placeholder_teams AS (
  SELECT t.id
  FROM public.teams t
  WHERE
    COALESCE(t.name, '') ILIKE '%test match%'
    OR COALESCE(t.name, '') ILIKE 'test%'
    OR COALESCE(t.name, '') ILIKE 'demo%'
    OR COALESCE(t.league, '') ILIKE '%test%'
    OR COALESCE(t.league, '') ILIKE '%demo%'
),
linked_by_id AS (
  SELECT DISTINCT home_team_id AS team_id
  FROM public.matches
  WHERE home_team_id IS NOT NULL

  UNION

  SELECT DISTINCT away_team_id AS team_id
  FROM public.matches
  WHERE away_team_id IS NOT NULL
),
linked_by_name AS (
  SELECT DISTINCT t.id AS team_id
  FROM public.teams t
  JOIN public.matches m
    ON m.home_team_name = t.name
    OR m.away_team_name = t.name
),
deletable_placeholder_teams AS (
  SELECT pt.id
  FROM placeholder_teams pt
  LEFT JOIN linked_by_id li ON li.team_id = pt.id
  LEFT JOIN linked_by_name ln ON ln.team_id = pt.id
  WHERE li.team_id IS NULL
    AND ln.team_id IS NULL
)
DELETE FROM public.teams
WHERE id IN (SELECT id FROM deletable_placeholder_teams);