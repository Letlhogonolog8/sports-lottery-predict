import React, { useState } from 'react';
import { Match } from '@/lib/sportsData';
import { getTeamLogo, DEFAULT_TEAM_LOGO } from '@/lib/teamLogos';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface LiveMatchCardProps {
  match: Match;
  onSelectPrediction?: (matchId: string, prediction: string) => void;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, onSelectPrediction }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedBet, setSelectedBet] = useState<string | null>(null);

  // Use match data directly (already transformed in AppLayout)
  const matchData = match;

  const getMatchTime = () => {
    if (matchData.status === 'live') {
      // Show minute if it exists and is >= 0
      if (typeof matchData.minute === 'number' && matchData.minute >= 0) {
        return `${matchData.minute}'`;
      }
      return 'Starting...';
    }
    if (matchData.startTime) {
      try {
        const time = new Date(matchData.startTime);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        return 'TBA';
      }
    }
    return 'TBA';
  };

  const getMomentumIcon = () => {
    if (matchData.momentum === 'home') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (matchData.momentum === 'away') return <TrendingDown className="w-4 h-4 text-rose-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const prediction = matchData.prediction;
  const odds = matchData.odds;
  const hasPrediction = !!prediction;
  const hasLiveStats = !!matchData.keyStats;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'from-emerald-500 to-emerald-400';
    if (confidence >= 60) return 'from-cyan-500 to-cyan-400';
    if (confidence >= 40) return 'from-amber-500 to-amber-400';
    return 'from-rose-500 to-rose-400';
  };

  const handleBetSelect = (betType: string) => {
    setSelectedBet(betType);
    onSelectPrediction?.(matchData.id, betType);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-cyan-500/30 transition-all duration-300 group">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800/50 to-transparent border-b border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">{matchData.league}</span>
          {matchData.status === 'live' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-rose-400">LIVE</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getMomentumIcon()}
          <span className="text-xs text-slate-500">{getMatchTime()}</span>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-0.5 group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-all flex-shrink-0">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={matchData.homeTeamLogo || getTeamLogo(matchData.homeTeam)} alt={matchData.homeTeam} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_TEAM_LOGO; }} />
              </div>
            </div>
            <p className="text-xs font-semibold text-white mt-2 line-clamp-1 text-center">{matchData.homeTeam}</p>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center flex-shrink-0">
            {matchData.status === 'live' || matchData.status === 'finished' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-white">{matchData.homeScore}</span>
                <span className="text-sm text-slate-500">-</span>
                <span className="text-2xl font-bold text-white">{matchData.awayScore}</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-400">VS</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-0.5 group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-all flex-shrink-0">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={matchData.awayTeamLogo || getTeamLogo(matchData.awayTeam)} alt={matchData.awayTeam} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_TEAM_LOGO; }} />
              </div>
            </div>
            <p className="text-xs font-semibold text-white mt-2 line-clamp-1 text-center">{matchData.awayTeam}</p>
          </div>
        </div>

        {/* AI Prediction Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              AI Prediction
            </span>
            <span className={`text-xs font-bold bg-gradient-to-r ${getConfidenceColor(prediction?.confidence || 0)} bg-clip-text text-transparent`}>
              {hasPrediction ? `${prediction?.confidence}% Confidence` : 'No model output'}
            </span>
          </div>
          {hasPrediction ? (
            <>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${prediction?.homeWin || 0}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-500"
                  style={{ width: `${prediction?.draw || 0}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500"
                  style={{ width: `${prediction?.awayWin || 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-emerald-400">{prediction?.homeWin || 0}%</span>
                {(prediction?.draw || 0) > 0 && <span className="text-[10px] text-slate-400">{prediction?.draw || 0}%</span>}
                <span className="text-[10px] text-rose-400">{prediction?.awayWin || 0}%</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">Prediction not available yet for this match.</div>
          )}
        </div>

        {/* Betting Options */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleBetSelect('home')}
            disabled={!odds?.homeWin}
            className={`py-2 px-3 rounded-lg text-center transition-all duration-200 ${
              selectedBet === 'home'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            } ${!odds?.homeWin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="block text-[10px] text-slate-400 mb-0.5">1</span>
            <span className="block text-sm font-bold">{odds?.homeWin ? odds.homeWin.toFixed(2) : 'N/A'}</span>
          </button>
          <button
            onClick={() => handleBetSelect('draw')}
            disabled={!odds?.draw}
            className={`py-2 px-3 rounded-lg text-center transition-all duration-200 ${
              selectedBet === 'draw'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            } ${!odds?.draw ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="block text-[10px] text-slate-400 mb-0.5">X</span>
            <span className="block text-sm font-bold">{odds?.draw ? odds.draw.toFixed(2) : 'N/A'}</span>
          </button>
          <button
            onClick={() => handleBetSelect('away')}
            disabled={!odds?.awayWin}
            className={`py-2 px-3 rounded-lg text-center transition-all duration-200 ${
              selectedBet === 'away'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            } ${!odds?.awayWin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="block text-[10px] text-slate-400 mb-0.5">2</span>
            <span className="block text-sm font-bold">{odds?.awayWin ? odds.awayWin.toFixed(2) : 'N/A'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Stats */}
      {matchData.status === 'live' && hasLiveStats && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 px-4 bg-slate-800/50 border-t border-slate-700/30 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide Stats' : 'View Live Stats'}
          </button>
          
          {expanded && (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <StatBar label="Possession" home={matchData.keyStats.possession[0]} away={matchData.keyStats.possession[1]} />
              <StatBar label="Shots" home={matchData.keyStats.shots[0]} away={matchData.keyStats.shots[1]} />
              <StatBar label="On Target" home={matchData.keyStats.shotsOnTarget[0]} away={matchData.keyStats.shotsOnTarget[1]} />
              <StatBar label="Corners" home={matchData.keyStats.corners[0]} away={matchData.keyStats.corners[1]} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatBar: React.FC<{ label: string; home: number; away: number }> = ({ label, home, away }) => {
  const total = home + away || 1;
  const homePercent = (home / total) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-cyan-400 font-medium">{home}</span>
        <span className="text-slate-500">{label}</span>
        <span className="text-rose-400 font-medium">{away}</span>
      </div>
      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  );
};

export default LiveMatchCard;
