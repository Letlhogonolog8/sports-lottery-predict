import re
import html
import argparse
from collections import defaultdict, Counter
from urllib.request import Request, urlopen
from pathlib import Path

TARGETS_BY_SPORT = {
    "football": [
        "https://supersport.com/football/fixtures",
        "https://supersport.com/football/results",
    ],
    "basketball": [
        "https://supersport.com/basketball/fixtures",
        "https://supersport.com/basketball/results",
    ],
    "rugby": [
        "https://supersport.com/rugby/fixtures",
        "https://supersport.com/rugby/results",
    ],
    "cricket": [
        "https://supersport.com/cricket/fixtures",
        "https://supersport.com/cricket/results",
    ],
}

BLOCKED = {
    "FULL SCHEDULE", "ALL TOURNAMENTS", "FIXTURES", "RESULTS", "VIDEOS", "NEWS", "LOAD MORE",
    "TODAY", "SCORES", "IN PLAY", "CATCH IT LIVE ON SUPERSPORT"
}

EXCLUDED = {
    "Home", "TV Guide", "Scores", "Win", "More Tournaments", "More", "Football", "Rugby", "Cricket", "Golf"
}

EXCLUDED_EXACT = {
    "Betway Premiership", "French Ligue 1", "Italy Serie A", "La Liga", "Six Nations", "Johannesburg", "Pretoria"
}


def clean_line(value: str) -> str:
    value = value.replace("\u00A0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def strip_html_to_lines(source: str):
    source = re.sub(r"<script[\s\S]*?</script>", " ", source, flags=re.I)
    source = re.sub(r"<style[\s\S]*?</style>", " ", source, flags=re.I)
    source = re.sub(r"<[^>]+>", "\n", source)
    source = html.unescape(source)
    lines = [clean_line(x) for x in source.splitlines()]
    lines = [x for x in lines if x]
    deduped = []
    for line in lines:
        if not deduped or deduped[-1] != line:
            deduped.append(line)
    return deduped


def is_league_heading(line: str) -> bool:
    if not line or len(line) < 4 or len(line) > 80:
        return False
    if any(ch.isdigit() for ch in line):
        return False
    if "DAY, " in line:
        return False
    if line in BLOCKED:
        return False
    return line.upper() == line and re.search(r"[A-Z]", line) is not None


def is_team_line(line: str, freq: Counter) -> bool:
    if not line:
        return False
    if len(line) < 2 or len(line) > 45:
        return False
    if freq[line] < 2:
        return False
    if re.fullmatch(r"\d+", line):
        return False
    if re.search(r"\d+:\d+", line):
        return False
    if re.search(r"\d+\s*/\s*\d+", line):
        return False
    if "," in line:
        return False
    if "|" in line:
        return False
    if re.search(r"\b(FT|In Play|Overs|ov|V|vs|Catch it live|Load more|Full Schedule|All tournaments|Fixtures|Results|Videos|News|won by|Method|Matchweek|Semi Final|Final|Pool Game|ODI|T20I|Test)\b", line, flags=re.I):
        return False
    if re.search(r"\b(Stadium|Oval|Park|Ground|Arena|Campus|Club|TBC)\b", line, flags=re.I):
        return False
    if re.search(r"\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b", line, flags=re.I):
        return False
    if re.search(r"\b(Cup|League|Championship|Qualifiers|World Cup|Nations League|Challenge|Diski|Wafa Wafa|Sevens|Premiership|Ligue|Serie A|LaLiga|La Liga)\b", line, flags=re.I):
        return False
    if line in EXCLUDED_EXACT:
        return False
    if not re.search(r"[A-Za-z]", line):
        return False
    if line in EXCLUDED:
        return False
    return True


def fetch_text(url: str) -> str:
    req = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    with urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def scrape_pairs(sport: str, lines):
    rows = []
    active_league = f"{sport.upper()} SCHEDULE"
    freq = Counter(lines)
    for i, current in enumerate(lines):
        if is_league_heading(current):
            active_league = current
            continue
        if not is_team_line(current, freq):
            continue
        for j in range(i + 1, min(i + 5, len(lines))):
            candidate = lines[j]
            if not is_team_line(candidate, freq):
                continue
            if candidate == current:
                continue
            rows.append((current, sport, active_league))
            rows.append((candidate, sport, active_league))
            break
    return rows


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def derive_country(league: str):
    if " - " in league:
        left = league.split(" - ", 1)[0].strip()
        return left if left else None
    return None


def build_targets(selected_sports):
    targets = []
    for sport in selected_sports:
        for url in TARGETS_BY_SPORT.get(sport, []):
            targets.append((sport, url))
    return targets


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sports", default="football,basketball,rugby,cricket")
    parser.add_argument("--output", default="supabase/migrations/006_supersport_scraped_teams.sql")
    return parser.parse_args()


def main():
    args = parse_args()
    selected_sports = [x.strip().lower() for x in args.sports.split(",") if x.strip()]
    targets = build_targets(selected_sports)

    all_rows = []
    for sport, url in targets:
        try:
            html_text = fetch_text(url)
            lines = strip_html_to_lines(html_text)
            all_rows.extend(scrape_pairs(sport, lines))
        except Exception:
            continue

    votes = defaultdict(Counter)
    sport_by_team = {}

    for name, sport, league in all_rows:
        votes[name][league] += 1
        sport_by_team.setdefault(name, sport)

    names = sorted(votes.keys())
    values_sql = []
    for name in names:
        league = votes[name].most_common(1)[0][0]
        sport = sport_by_team[name]
        country = derive_country(league)
        country_sql = f"'{sql_escape(country)}'" if country else "NULL"
        values_sql.append(
            f"('{sql_escape(name)}', '{sql_escape(sport)}', '{sql_escape(league)}', {country_sql})"
        )

    out = []
    out.append("INSERT INTO public.teams (name, sport, league, country)")
    out.append("VALUES")
    out.append(",\n".join(values_sql))
    out.append("ON CONFLICT (name)")
    out.append("DO UPDATE SET")
    out.append("  sport = EXCLUDED.sport,")
    out.append("  league = EXCLUDED.league,")
    out.append("  country = COALESCE(EXCLUDED.country, public.teams.country);")

    out_path = Path(args.output)
    out_path.write_text("\n".join(out), encoding="utf-8")

    by_sport = Counter(sport_by_team.values())

    print(f"targets={len(targets)}")
    print(f"sports={','.join(selected_sports)}")
    print(f"raw_rows={len(all_rows)}")
    print(f"unique_teams={len(names)}")
    print(f"by_sport={dict(by_sport)}")
    print(f"migration={out_path}")


if __name__ == "__main__":
    main()
