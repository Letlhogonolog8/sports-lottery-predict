export const DEFAULT_TEAM_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%231e293b'/%3E%3Cstop offset='1' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='url(%23g)'/%3E%3Cpath d='M32 10l16 6v12c0 12-7.5 22-16 26-8.5-4-16-14-16-26V16l16-6z' fill='%23334155'/%3E%3Cpath d='M32 16l11 4.1V28c0 8.2-4.8 15.6-11 19-6.2-3.4-11-10.8-11-19v-7.9L32 16z' fill='%2364748b'/%3E%3Ccircle cx='32' cy='30' r='6' fill='%2394a3b8'/%3E%3C/svg%3E";

export const TEAM_LOGOS: Record<string, string> = {
  'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7b/Manchester_United_FC_badge.svg',
  Arsenal: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
  Liverpool: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
  Chelsea: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
  'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
  Tottenham: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
  Brighton: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_and_Hove_Albion_FC_badge.svg',
  'Aston Villa': 'https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest.svg',
  Newcastle: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
  Fulham: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg',
  'West Ham': 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
  Everton: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
  'Crystal Palace': 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg',
  'Kaizer Chiefs': 'https://upload.wikimedia.org/wikipedia/en/8/88/Kaizer_Chiefs_logo.svg',
  'Orlando Pirates': 'https://upload.wikimedia.org/wikipedia/en/d/d9/Orlando_Pirates_logo.svg',

  'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  Barcelona: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%282009%E2%80%93present%29.svg',
  'Atletico Madrid': 'https://upload.wikimedia.org/wikipedia/en/3/3f/Atletico_Madrid_2012_logo.svg',
  Getafe: 'https://upload.wikimedia.org/wikipedia/en/4/43/Getafe_CF.svg',
  Sevilla: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Sevilla_FC_logo.svg',
  Valencia: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
  Villarreal: 'https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg',
  Betis: 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg',
  'Real Sociedad': 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',

  Juventus: 'https://upload.wikimedia.org/wikipedia/en/0/05/Juventus_FC_2017_logo.svg',
  'Inter Milan': 'https://upload.wikimedia.org/wikipedia/en/b/b5/Inter_Milan.svg',
  'AC Milan': 'https://upload.wikimedia.org/wikipedia/en/d/d0/AC_Milan.svg',
  Roma: 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
  Napoli: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg',
  Lazio: 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg',

  'Paris Saint-Germain': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_FC.svg',
  Marseille: 'https://upload.wikimedia.org/wikipedia/en/3/32/Olympique_de_Marseille_logo.svg',
  Lyon: 'https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg',
  Monaco: 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg',

  'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/en/1/1b/FC_Bayern_Munich_logo.svg',
  'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/en/d/df/Borussia_Dortmund_logo.svg',
  'RB Leipzig': 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
  'Union Berlin': 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg',

  'Los Angeles Lakers': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
  'Boston Celtics': 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
  'Golden State Warriors': 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
  'Miami Heat': 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg',
  'Chicago Bulls': 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg',
  'Denver Nuggets': 'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg',
  'New York Knicks': 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg',
  'Los Angeles Clippers': 'https://upload.wikimedia.org/wikipedia/en/b/bb/Los_Angeles_Clippers_%282015%29.svg',

  India: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg',
  England: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
  Pakistan: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg',
  Australia: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg',
  'West Indies': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/West_indies_cricket_logo.svg',
  'South Africa': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg',

  'New England Patriots': 'https://upload.wikimedia.org/wikipedia/en/b/b9/New_England_Patriots_logo.svg',
  'Dallas Cowboys': 'https://upload.wikimedia.org/wikipedia/en/4/45/Dallas_Cowboys.svg',
  'Green Bay Packers': 'https://upload.wikimedia.org/wikipedia/en/5/56/Green_Bay_Packers_logo.svg',
  'Kansas City Chiefs': 'https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg',
};

const TEAM_ALIASES: Record<string, string> = {
  'Tottenham Hotspur': 'Tottenham',
  'Brighton & Hove Albion': 'Brighton',
  'Brighton and Hove Albion': 'Brighton',
  'Aston Villa FC': 'Aston Villa',
  'Manchester United FC': 'Manchester United',
  'Manchester City FC': 'Manchester City',
  'West Ham United': 'West Ham',
  'Crystal Palace FC': 'Crystal Palace',
  'Kaizer Chiefs FC': 'Kaizer Chiefs',
  'Orlando Pirates FC': 'Orlando Pirates',
  Spurs: 'Tottenham',
  'Getafe CF': 'Getafe',
  'FC Barcelona': 'Barcelona',
  'FC Bayern Munich': 'Bayern Munich',
  'PSG': 'Paris Saint-Germain',
  'Inter': 'Inter Milan',
  'Internazionale': 'Inter Milan',
  'AS Roma': 'Roma',
  'SSC Napoli': 'Napoli',
  'LA Lakers': 'Los Angeles Lakers',
  Celtics: 'Boston Celtics',
  Lakers: 'Los Angeles Lakers',
  Warriors: 'Golden State Warriors',
  Knicks: 'New York Knicks',
  Clippers: 'Los Angeles Clippers',
};

const normalizeTeamName = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|afc|sc|ac)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
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

export function getTeamLogo(teamName: string): string {
  if (!teamName) return DEFAULT_TEAM_LOGO;

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

  return DEFAULT_TEAM_LOGO;
}
