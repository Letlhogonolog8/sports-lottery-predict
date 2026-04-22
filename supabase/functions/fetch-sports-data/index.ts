import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { getCorsHeaders, healthResponse, isUserAuthorized } from "../_shared/http.ts";

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
    type: string;
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

interface FootballMatch {
  id: string;
  homeTeam: { name: string; id: number };
  awayTeam: { name: string; id: number };
  utcDate: string;
  status: string;
  minute?: number;
  competition?: { name?: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

interface PersistedMatch {
  match_id: string;
  sport: string;
  league: string;
  home_team_name: string;
  away_team_name: string;
  status: "live" | "finished" | "upcoming";
  home_score: number | null;
  away_score: number | null;
  start_time: string;
  minute: number | null;
}

interface PersistedMatchWithTeams extends PersistedMatch {
  home_team_id?: string | null;
  away_team_id?: string | null;
}

const TEAM_LOGOS: Record<string, string> = {
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/7/7b/Manchester_United_FC_badge.svg",
  Arsenal: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  Liverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  Chelsea: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  Tottenham: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  Brighton: "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_and_Hove_Albion_FC_badge.svg",
  "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest.svg",
  Newcastle: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
  Fulham: "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg",
  "West Ham": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
  Everton: "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
  "Crystal Palace": "https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg",
  "Kaizer Chiefs": "https://upload.wikimedia.org/wikipedia/en/8/88/Kaizer_Chiefs_logo.svg",
  "Orlando Pirates": "https://upload.wikimedia.org/wikipedia/en/d/d9/Orlando_Pirates_logo.svg",
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  Barcelona: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%282009%E2%80%93present%29.svg",
  "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/3/3f/Atletico_Madrid_2012_logo.svg",
  Getafe: "https://upload.wikimedia.org/wikipedia/en/4/43/Getafe_CF.svg",
  Sevilla: "https://upload.wikimedia.org/wikipedia/en/3/3e/Sevilla_FC_logo.svg",
  Valencia: "https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg",
  Villarreal: "https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg",
  Betis: "https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg",
  "Real Sociedad": "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
  Juventus: "https://upload.wikimedia.org/wikipedia/en/0/05/Juventus_FC_2017_logo.svg",
  "Inter Milan": "https://upload.wikimedia.org/wikipedia/en/b/b5/Inter_Milan.svg",
  "AC Milan": "https://upload.wikimedia.org/wikipedia/en/d/d0/AC_Milan.svg",
  Roma: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  Napoli: "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg",
  Lazio: "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg",
  "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_FC.svg",
  Marseille: "https://upload.wikimedia.org/wikipedia/en/3/32/Olympique_de_Marseille_logo.svg",
  Lyon: "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  Monaco: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg",
  "Bayern Munich": "https://upload.wikimedia.org/wikipedia/en/1/1b/FC_Bayern_Munich_logo.svg",
  "Borussia Dortmund": "https://upload.wikimedia.org/wikipedia/en/d/df/Borussia_Dortmund_logo.svg",
  "RB Leipzig": "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
  "Union Berlin": "https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg",
  "Los Angeles Lakers": "https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg",
  "Boston Celtics": "https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg",
  "Golden State Warriors": "https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg",
  "Miami Heat": "https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg",
  "Chicago Bulls": "https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg",
  "Denver Nuggets": "https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg",
  "New York Knicks": "https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg",
  "Los Angeles Clippers": "https://upload.wikimedia.org/wikipedia/en/b/bb/Los_Angeles_Clippers_%282015%29.svg",
  India: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
  England: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
  Pakistan: "https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg",
  Australia: "https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg",
  "West Indies": "https://upload.wikimedia.org/wikipedia/commons/0/0f/West_indies_cricket_logo.svg",
  "South Africa": "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg",
  "New England Patriots": "https://upload.wikimedia.org/wikipedia/en/b/b9/New_England_Patriots_logo.svg",
  "Dallas Cowboys": "https://upload.wikimedia.org/wikipedia/en/4/45/Dallas_Cowboys.svg",
  "Green Bay Packers": "https://upload.wikimedia.org/wikipedia/en/5/56/Green_Bay_Packers_logo.svg",
  "Kansas City Chiefs": "https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg",
};

const TEAM_ALIASES: Record<string, string> = {
  "Tottenham Hotspur": "Tottenham",
  "Brighton & Hove Albion": "Brighton",
  "Brighton and Hove Albion": "Brighton",
  "Aston Villa FC": "Aston Villa",
  "Manchester United FC": "Manchester United",
  "Manchester City FC": "Manchester City",
  "West Ham United": "West Ham",
  "Crystal Palace FC": "Crystal Palace",
  "Kaizer Chiefs FC": "Kaizer Chiefs",
  "Orlando Pirates FC": "Orlando Pirates",
  Spurs: "Tottenham",
  "Getafe CF": "Getafe",
  "FC Barcelona": "Barcelona",
  "FC Bayern Munich": "Bayern Munich",
  PSG: "Paris Saint-Germain",
  Inter: "Inter Milan",
  Internazionale: "Inter Milan",
  "AS Roma": "Roma",
  "SSC Napoli": "Napoli",
  "LA Lakers": "Los Angeles Lakers",
  Celtics: "Boston Celtics",
  Lakers: "Los Angeles Lakers",
  Warriors: "Golden State Warriors",
  Knicks: "New York Knicks",
  Clippers: "Los Angeles Clippers",
};

const normalizeTeamName = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|afc|sc|ac)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const normalizedLogos = new Map<string, string>();

Object.entries(TEAM_LOGOS).forEach(([name, url]) => {
  normalizedLogos.set(normalizeTeamName(name), url);
});

Object.entries(TEAM_ALIASES).forEach(([alias, canonical]) => {
  const canonicalLogo = TEAM_LOGOS[canonical];
  if (canonicalLogo) {
    normalizedLogos.set(normalizeTeamName(alias), canonicalLogo);
  }
});

const resolveTeamLogo = (teamName: string): string | null => {
  if (!teamName) return null;

  const directLogo = TEAM_LOGOS[teamName];
  if (directLogo) return directLogo;

  const aliasLogo = TEAM_ALIASES[teamName] ? TEAM_LOGOS[TEAM_ALIASES[teamName]] : undefined;
  if (aliasLogo) return aliasLogo;

  const normalizedName = normalizeTeamName(teamName);
  const normalizedLogo = normalizedLogos.get(normalizedName);
  if (normalizedLogo) return normalizedLogo;

  for (const [key, url] of normalizedLogos.entries()) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return url;
    }
  }

  return null;
};

const extractCountryFromLeague = (league: string): string | null => {
  if (!league) return null;
  const [country] = league.split(" - ");
  if (!country || country.trim().length === 0) return null;
  return country.trim();
};

const normalizeMatchStatus = (match: PersistedMatch): PersistedMatch => {
  const nowMs = Date.now();
  const startMs = new Date(match.start_time).getTime();
  const elapsedMinutes = Math.floor((nowMs - startMs) / 60000);

  if (!Number.isFinite(elapsedMinutes)) {
    return match;
  }

  if (elapsedMinutes >= 120) {
    return {
      ...match,
      status: "finished",
      minute: 90,
    };
  }

  if (elapsedMinutes > 0 && match.status === "upcoming") {
    return {
      ...match,
      status: "live",
      minute: match.minute ?? Math.min(elapsedMinutes, 90),
    };
  }

  if (elapsedMinutes <= 0 && match.status !== "upcoming") {
    return {
      ...match,
      status: "upcoming",
      minute: null,
    };
  }

  return match;
};

const isCronAuthorized = (req: Request): boolean => {
  const configured = Deno.env.get("FETCH_SPORTS_DATA_SECRET");
  if (!configured) return false;
  return req.headers.get("X-Cron-Secret") === configured;
};

interface ScrapedTeam {
  name: string;
  sport: string;
  league: string;
}

const SUPERSPORT_SCRAPE_TARGETS: Array<{ sport: string; url: string }> = [
  { sport: "football", url: "https://supersport.com/football/fixtures" },
  { sport: "football", url: "https://supersport.com/football/results" },
  { sport: "basketball", url: "https://supersport.com/basketball/fixtures" },
  { sport: "basketball", url: "https://supersport.com/basketball/results" },
];

const isLeagueHeading = (line: string): boolean => {
  if (!line || line.length < 4 || line.length > 80) return false;
  if (!/[A-Z]/.test(line)) return false;
  if (/\d/.test(line)) return false;
  const blocked = new Set([
    "FULL SCHEDULE",
    "ALL TOURNAMENTS",
    "FIXTURES",
    "RESULTS",
    "VIDEOS",
    "NEWS",
    "LOAD MORE",
    "TODAY",
    "SCORES",
    "IN PLAY",
    "CATCH IT LIVE ON SUPERSPORT",
  ]);
  if (blocked.has(line)) return false;
  if (line.includes("DAY, ")) return false;
  return line === line.toUpperCase();
};

const isTeamNameLine = (line: string): boolean => {
  if (!line) return false;
  const value = line.trim();
  if (value.length < 2 || value.length > 60) return false;
  if (/^\d+$/.test(value)) return false;
  if (/\d+:\d+/.test(value)) return false;
  if (/\b(FT|In Play|Overs|ov|V|vs|Catch it live|Load more|Full Schedule|All tournaments|Fixtures|Results|Videos|News)\b/i.test(value)) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  const excluded = ["Home", "TV Guide", "Scores", "Win", "More Tournaments", "More", "Football", "Rugby", "Cricket", "Golf"];
  if (excluded.includes(value)) return false;
  return true;
};

const cleanLine = (line: string): string =>
  line
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripHtmlToLines = (html: string): string[] => {
  const decoded = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const rawLines = decoded.split(/\r?\n/g).map(cleanLine).filter(Boolean);
  const deduped: string[] = [];
  for (const line of rawLines) {
    if (deduped.length === 0 || deduped[deduped.length - 1] !== line) {
      deduped.push(line);
    }
  }
  return deduped;
};

const extractTeamsFromLines = (sport: string, lines: string[]): ScrapedTeam[] => {
  const teams: ScrapedTeam[] = [];
  let activeLeague = `${sport.toUpperCase()} SCHEDULE`;

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    if (isLeagueHeading(current)) {
      activeLeague = current;
      continue;
    }

    if (!isTeamNameLine(current)) {
      continue;
    }

    for (let j = i + 1; j <= i + 4 && j < lines.length; j++) {
      const candidate = lines[j];
      if (!isTeamNameLine(candidate)) {
        continue;
      }

      if (candidate === current) {
        continue;
      }

      teams.push({ name: current, sport, league: activeLeague });
      teams.push({ name: candidate, sport, league: activeLeague });
      break;
    }
  }

  return teams;
};

const aggregateScrapedTeams = (teams: ScrapedTeam[]) => {
  const agg = new Map<string, { sport: string; leagueVotes: Map<string, number> }>();

  for (const team of teams) {
    if (!agg.has(team.name)) {
      agg.set(team.name, { sport: team.sport, leagueVotes: new Map<string, number>() });
    }
    const row = agg.get(team.name)!;
    const votes = row.leagueVotes.get(team.league) || 0;
    row.leagueVotes.set(team.league, votes + 1);
  }

  return Array.from(agg.entries()).map(([name, value]) => {
    const topLeague = Array.from(value.leagueVotes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || `${value.sport.toUpperCase()} SCHEDULE`;
    const logo = resolveTeamLogo(name);
    const row: { name: string; sport: string; league: string; country: string | null; logo_url?: string } = {
      name,
      sport: value.sport,
      league: topLeague,
      country: extractCountryFromLeague(topLeague),
    };
    if (logo) {
      row.logo_url = logo;
    }
    return row;
  });
};

async function scrapeSuperSportTeams(): Promise<Array<{ name: string; sport: string; league: string; country: string | null; logo_url?: string }>> {
  const collected: ScrapedTeam[] = [];

  for (const target of SUPERSPORT_SCRAPE_TARGETS) {
    try {
      const response = await fetch(target.url, {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      const lines = stripHtmlToLines(html);
      const pageTeams = extractTeamsFromLines(target.sport, lines);
      collected.push(...pageTeams);
    } catch (error) {
      console.error("SuperSport scrape error:", error);
    }
  }

  return aggregateScrapedTeams(collected);
}

async function fetchFootballData(apiKey: string): Promise<FootballMatch[]> {
  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED,LIVE",
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error("Error fetching football data:", error);
    return [];
  }
}

async function fetchSofaScoreLiveMatches(): Promise<PersistedMatch[]> {
  try {
    const [footballMatches, basketballMatches] = await Promise.all([
      fetchSofaScoreSport("football"),
      fetchSofaScoreSport("basketball"),
    ]);

    return [...footballMatches, ...basketballMatches];
  } catch (error) {
    console.error("SofaScore error:", error);
    return [];
  }
}

async function fetchSofaScoreSport(sport: string): Promise<PersistedMatch[]> {
  try {
    const endpoints = ["live", "next", "last"];
    const allEvents: SofaScoreMatch[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(
          `https://api.sofascore.com/api/v1/sport/${sport}/events/${endpoint}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          }
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const events = data.events || [];
        allEvents.push(...events);
      } catch {
        continue;
      }
    }

    if (allEvents.length === 0) return [];

    const dedupedEvents = Array.from(new Map(allEvents.map((event) => [event.id, event])).values());
    const now = Date.now() / 1000;

    return dedupedEvents
      .filter((event: SofaScoreMatch) => {
        const eventTime = event.startTimestamp;
        return now - eventTime < 86400 && eventTime - now < 1209600;
      })
      .map((event: SofaScoreMatch) => {
        const mapped: PersistedMatch = {
          match_id: `sofascore_${sport}_${event.id}`,
          sport,
          league: `${event.tournament.category.name} - ${event.tournament.name}`,
          home_team_name: event.homeTeam.name,
          away_team_name: event.awayTeam.name,
          status:
            event.status.type === "inprogress"
              ? "live"
              : event.status.type === "finished"
                ? "finished"
                : "upcoming",
          home_score:
            event.status.type === "finished" || event.status.type === "inprogress"
              ? event.homeScore.display
              : null,
          away_score:
            event.status.type === "finished" || event.status.type === "inprogress"
              ? event.awayScore.display
              : null,
          start_time: new Date(event.startTimestamp * 1000).toISOString(),
          minute: event.status.type === "inprogress" ? Math.floor(event.time.currentDisplaySeconds / 60) : null,
        };

        return normalizeMatchStatus(mapped);
      });
  } catch (error) {
    console.error(`SofaScore ${sport} error:`, error);
    return [];
  }
}

async function fetchLiveMatches(): Promise<PersistedMatch[]> {
  try {
    let matches = await fetchSofaScoreLiveMatches();

    if (!matches || matches.length === 0) {
      const footballApiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");

      if (footballApiKey) {
        try {
          const footballMatches = await fetchFootballData(footballApiKey);
          matches = footballMatches.map((m: FootballMatch) =>
            normalizeMatchStatus({
              match_id: `football_${m.id}`,
              sport: "football",
              league: m.competition?.name || "Premier League",
              home_team_name: m.homeTeam.name,
              away_team_name: m.awayTeam.name,
              status: m.status === "LIVE" ? "live" : "upcoming",
              home_score: m.score.fullTime.home,
              away_score: m.score.fullTime.away,
              start_time: new Date(m.utcDate).toISOString(),
              minute: m.status === "LIVE" ? m.minute || 0 : null,
            })
          );
          return matches;
        } catch (apiError) {
          console.error("Football API error:", apiError);
        }
      }
    }

    return matches;
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
}

async function upsertTeamsAndAttachIds(
  supabase: ReturnType<typeof createClient>,
  matches: PersistedMatch[],
  scrapedTeams: Array<{ name: string; sport: string; league: string; country: string | null; logo_url?: string }>
): Promise<PersistedMatchWithTeams[]> {
  const teamMap = new Map<string, { name: string; sport: string; league: string; country: string | null; logo_url?: string }>();

  for (const team of scrapedTeams) {
    if (!team.name || teamMap.has(team.name)) continue;
    teamMap.set(team.name, team);
  }

  for (const match of matches) {
    const teams = [
      { name: match.home_team_name, sport: match.sport, league: match.league },
      { name: match.away_team_name, sport: match.sport, league: match.league },
    ];

    for (const team of teams) {
      if (!team.name) continue;
      const logo = resolveTeamLogo(team.name);
      const row: { name: string; sport: string; league: string; country: string | null; logo_url?: string } = {
        name: team.name,
        sport: team.sport,
        league: team.league,
        country: extractCountryFromLeague(team.league),
      };
      if (logo) {
        row.logo_url = logo;
      }
      teamMap.set(team.name, row);
    }
  }

  const teamRows = Array.from(teamMap.values());

  if (teamRows.length > 0) {
    const { error: teamUpsertError } = await supabase
      .from("teams")
      .upsert(teamRows, { onConflict: "name" });

    if (teamUpsertError) {
      throw new Error(`Error upserting teams: ${teamUpsertError.message}`);
    }
  }

  if (matches.length === 0) {
    return [];
  }

  const teamNames = Array.from(new Set(matches.flatMap((match) => [match.home_team_name, match.away_team_name]).filter(Boolean)));
  const { data: teamsData, error: teamsFetchError } = await supabase
    .from("teams")
    .select("id, name")
    .in("name", teamNames);

  if (teamsFetchError) {
    throw new Error(`Error fetching team ids: ${teamsFetchError.message}`);
  }

  const teamIdByName = new Map<string, string>();
  for (const row of teamsData || []) {
    teamIdByName.set(row.name, row.id);
  }

  return matches.map((match) => ({
    ...match,
    home_team_id: teamIdByName.get(match.home_team_name) || null,
    away_team_id: teamIdByName.get(match.away_team_name) || null,
  }));
}

async function updateMatches(
  supabase: ReturnType<typeof createClient>,
  matches: PersistedMatch[],
  scrapedTeams: Array<{ name: string; sport: string; league: string; country: string | null; logo_url?: string }>
): Promise<number> {
  try {
    const normalizedMatches = matches.map(normalizeMatchStatus);
    const matchesWithTeams = await upsertTeamsAndAttachIds(supabase, normalizedMatches, scrapedTeams);

    if (matchesWithTeams.length === 0) {
      return 0;
    }

    const { error } = await supabase
      .from("matches")
      .upsert(matchesWithTeams, { onConflict: "match_id" });

    if (error) {
      console.error("Error upserting matches:", error);
      return 0;
    }

    return matches.length;
  } catch (error) {
    console.error("Error updating matches:", error);
    return 0;
  }
}

serve(async (req) => {
  const startedAt = Date.now();
  const requestId = req.headers.get("X-Request-Id") || crypto.randomUUID();
  const headers = {
    ...getCorsHeaders(req, "POST, GET, OPTIONS", "X-Cron-Secret"),
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method === "GET") {
    return healthResponse("fetch-sports-data", requestId, headers);
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", requestId }), { status: 405, headers });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const footballApiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase configuration missing");
    }

    const allowed =
      isCronAuthorized(req) ||
      (await isUserAuthorized(req, supabaseUrl, anonKey || serviceRoleKey));

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Unauthorized", requestId }), {
        status: 401,
        headers,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const liveMatches = await fetchLiveMatches();
    const scrapedTeams = await scrapeSuperSportTeams();
    const matchesUpdated = await updateMatches(supabase, liveMatches, scrapedTeams);

    let footballMatches: FootballMatch[] = [];
    if (footballApiKey) {
      footballMatches = await fetchFootballData(footballApiKey);
    }

    const durationMs = Date.now() - startedAt;
    console.log(JSON.stringify({ requestId, event: "fetch_sports_data_success", durationMs, matchesUpdated, supersportTeamsScraped: scrapedTeams.length }));

    return new Response(
      JSON.stringify({
        success: true,
        requestId,
        matchesUpdated,
        supersportTeamsScraped: scrapedTeams.length,
        footballMatchesFetched: footballMatches.length,
        timestamp: new Date().toISOString(),
        durationMs,
      }),
      {
        headers,
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    const durationMs = Date.now() - startedAt;
    console.error(JSON.stringify({ requestId, event: "fetch_sports_data_error", durationMs, message }));
    return new Response(JSON.stringify({ error: message, requestId }), {
      status: 500,
      headers,
    });
  }
});