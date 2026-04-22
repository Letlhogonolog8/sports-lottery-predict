import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SportsCategoriesProps {
  selectedSport: string;
  onSelectSport: (sport: string) => void;
  sportCounts: Record<string, number>;
}

const sportIcons: Record<string, React.ReactNode> = {
  football: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zm0 2.5l-2.5 3.5h5L12 4.5zm-4.5 5L5 12l2.5 2.5 2-3.5-2-1.5zm9 0l-2 1.5 2 3.5L19 12l-2.5-2.5zm-6.5 5l2 3.5h4l2-3.5-4-1.5-4 1.5z"/>
    </svg>
  ),
  basketball: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v20M2 12h20M4.93 4.93c4.08 2.04 6.14 6.14 6.14 6.14M19.07 4.93c-4.08 2.04-6.14 6.14-6.14 6.14M4.93 19.07c4.08-2.04 6.14-6.14 6.14-6.14M19.07 19.07c-4.08-2.04-6.14-6.14-6.14-6.14" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  tennis: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 12c0-5 3-8 7-8M19 12c0 5-3 8-7 8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  cricket: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <rect x="10" y="2" width="4" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 18h8M12 18v4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  rugby: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <ellipse cx="12" cy="12" rx="10" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 12 12)"/>
      <path d="M8 8l8 8M8 16l8-8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  hockey: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M4 4l8 16M20 4l-8 16M4 14h16" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  baseball: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5c2 3 2 11 0 14M19 5c-2 3-2 11 0 14" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  esports: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 10v4M4 12h4M16 10l2 2-2 2M18 10l2 2-2 2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

const sportLabels: Record<string, string> = {
  football: 'Football',
  basketball: 'Basketball',
  tennis: 'Tennis',
  cricket: 'Cricket',
  rugby: 'Rugby',
  hockey: 'Hockey',
  baseball: 'Baseball',
  esports: 'E-Sports',
};

const SportsCategories: React.FC<SportsCategoriesProps> = ({ selectedSport, onSelectSport, sportCounts }) => {
  const sports = Object.entries(sportCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      name:
        sportLabels[id] ||
        id
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
      count,
    }));

  const totalEvents = sports.reduce((sum, sport) => sum + sport.count, 0);

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/30">
        <h3 className="text-lg font-bold text-white">Sports Categories</h3>
        <p className="text-xs text-slate-400 mt-1">Select a sport to filter predictions</p>
      </div>
      
      <div className="p-2">
        <button
          onClick={() => onSelectSport('all')}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
            selectedSport === 'all'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
              : 'hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedSport === 'all' ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 ${selectedSport === 'all' ? 'text-cyan-400' : 'text-slate-400'}`}>
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${selectedSport === 'all' ? 'text-cyan-400' : 'text-white'}`}>All Sports</p>
              <p className="text-xs text-slate-500">{totalEvents} events</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${selectedSport === 'all' ? 'text-cyan-400' : 'text-slate-500'}`} />
        </button>

        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              selectedSport === sport.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                : 'hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedSport === sport.id ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                <span className={selectedSport === sport.id ? 'text-cyan-400' : 'text-slate-400'}>
                  {sportIcons[sport.id] || (
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-bold">{sport.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </span>
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${selectedSport === sport.id ? 'text-cyan-400' : 'text-white'}`}>{sport.name}</p>
                <p className="text-xs text-slate-500">{sport.count} events</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${selectedSport === sport.id ? 'text-cyan-400' : 'text-slate-500'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SportsCategories;
