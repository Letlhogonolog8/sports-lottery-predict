// Types and mock data for the predictive analytics platform

export interface Match {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore?: number;
  awayScore?: number;
  startTime: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: number;
  prediction?: {
    homeWin: number;
    draw: number;
    awayWin: number;
    confidence: number;
  } | null;
  odds?: {
    homeWin: number | null;
    draw: number | null;
    awayWin: number | null;
  } | null;
  momentum: 'home' | 'away' | 'neutral';
  keyStats?: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
  } | null;
}

export interface LotteryDraw {
  id: string;
  name: string;
  nextDraw: string;
  jackpot: string;
  numbersRange: [number, number];
  pickCount: number;
  hotNumbers: number[];
  coldNumbers: number[];
  frequencyData: { number: number; frequency: number }[];
}

export interface Prediction {
  id: string;
  matchId: string;
  sport: string;
  teams: string;
  prediction: string;
  confidence: number;
  result: 'win' | 'loss' | 'pending';
  date: string;
  odds: number;
}

