WITH source_teams AS (
  SELECT DISTINCT home_team_name AS name, sport, league
  FROM public.matches
  WHERE home_team_name IS NOT NULL
    AND TRIM(home_team_name) <> ''

  UNION

  SELECT DISTINCT away_team_name AS name, sport, league
  FROM public.matches
  WHERE away_team_name IS NOT NULL
    AND TRIM(away_team_name) <> ''
),
filtered_teams AS (
  SELECT *
  FROM source_teams
  WHERE COALESCE(name, '') NOT ILIKE '%test match%'
    AND COALESCE(name, '') NOT ILIKE 'test%'
    AND COALESCE(name, '') NOT ILIKE 'demo%'
    AND COALESCE(league, '') NOT ILIKE '%test%'
    AND COALESCE(league, '') NOT ILIKE '%demo%'
),
ranked_teams AS (
  SELECT
    name,
    sport,
    league,
    NULLIF(TRIM(SPLIT_PART(league, ' - ', 1)), '') AS country,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY league ASC) AS rn
  FROM filtered_teams
)
INSERT INTO public.teams (name, sport, league, country)
SELECT name, sport, league, country
FROM ranked_teams
WHERE rn = 1
ON CONFLICT (name)
DO UPDATE
SET
  sport = EXCLUDED.sport,
  league = EXCLUDED.league,
  country = COALESCE(EXCLUDED.country, public.teams.country);

UPDATE public.matches AS m
SET home_team_id = t.id,
    updated_at = NOW()
FROM public.teams AS t
WHERE m.home_team_name = t.name
  AND m.home_team_name IS NOT NULL
  AND (m.home_team_id IS NULL OR m.home_team_id <> t.id);

UPDATE public.matches AS m
SET away_team_id = t.id,
    updated_at = NOW()
FROM public.teams AS t
WHERE m.away_team_name = t.name
  AND m.away_team_name IS NOT NULL
  AND (m.away_team_id IS NULL OR m.away_team_id <> t.id);