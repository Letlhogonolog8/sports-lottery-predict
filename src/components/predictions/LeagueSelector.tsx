import React from 'react';
import { ChevronRight } from 'lucide-react';

interface League {
  id: string;
  name: string;
  country: string;
  icon: string;
  matchCount: number;
}

interface LeagueSelectorProps {
  selectedLeague: string;
  onSelectLeague: (leagueId: string) => void;
  leagues?: League[];
  totalMatches?: number;
}

const leagues: League[] = [
  { id: 'premier', name: 'Premier League', country: 'England', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', matchCount: 10 },
  { id: 'laliga', name: 'La Liga', country: 'Spain', icon: '🇪🇸', matchCount: 10 },
  { id: 'seriea', name: 'Serie A', country: 'Italy', icon: '🇮🇹', matchCount: 10 },
  { id: 'bundesliga', name: 'Bundesliga', country: 'Germany', icon: '🇩🇪', matchCount: 9 },
  { id: 'ligue1', name: 'Ligue 1', country: 'France', icon: '🇫🇷', matchCount: 10 },
  { id: 'ucl', name: 'Champions League', country: 'Europe', icon: '🏆', matchCount: 8 },
  { id: 'uel', name: 'Europa League', country: 'Europe', icon: '🏆', matchCount: 8 },
  { id: 'mls', name: 'MLS', country: 'USA', icon: '🇺🇸', matchCount: 14 },
];

const LeagueSelector: React.FC<LeagueSelectorProps> = ({ selectedLeague, onSelectLeague, leagues: customLeagues, totalMatches }) => {
  const displayLeagues = customLeagues || leagues;
  const allLeagueMatches = typeof totalMatches === 'number' ? totalMatches : displayLeagues.reduce((sum, league) => sum + league.matchCount, 0);

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/30">
        <h3 className="text-lg font-bold text-white">Popular Leagues</h3>
        <p className="text-xs text-slate-400 mt-1">Select a league to view predictions</p>
      </div>

      <div className="p-2">
        <button
          onClick={() => onSelectLeague('all')}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
            selectedLeague === 'all'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
              : 'hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
              selectedLeague === 'all' ? 'bg-cyan-500/20' : 'bg-slate-700/50'
            }`}>
              🌍
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${selectedLeague === 'all' ? 'text-cyan-400' : 'text-white'}`}>
                All Leagues
              </p>
              <p className="text-xs text-slate-500">{allLeagueMatches} matches</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${selectedLeague === 'all' ? 'text-cyan-400' : 'text-slate-500'}`} />
        </button>

        {displayLeagues.map((league) => (
          <button
            key={league.id}
            onClick={() => onSelectLeague(league.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              selectedLeague === league.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                : 'hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                selectedLeague === league.id ? 'bg-cyan-500/20' : 'bg-slate-700/50'
              }`}>
                {league.icon}
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${selectedLeague === league.id ? 'text-cyan-400' : 'text-white'}`}>
                  {league.name}
                </p>
                <p className="text-xs text-slate-500">{league.country} • {league.matchCount} matches</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${selectedLeague === league.id ? 'text-cyan-400' : 'text-slate-500'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeagueSelector;
