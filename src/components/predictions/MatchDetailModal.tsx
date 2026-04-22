import React from 'react';
import { Match } from '@/lib/sportsData';
import { X, TrendingUp, TrendingDown, Minus, Clock, MapPin, Users, Zap, BarChart3 } from 'lucide-react';
import { getTeamLogo, DEFAULT_TEAM_LOGO } from '@/lib/teamLogos';

interface MatchDetailModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onSelectPrediction?: (matchId: string, prediction: string) => void;
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, isOpen, onClose, onSelectPrediction }) => {
  if (!isOpen) return null;

  const prediction = match.prediction;
  const odds = match.odds;
  const hasPrediction = !!prediction;
  const hasLiveStats = !!match.keyStats;

  const getMomentumIcon = () => {
    if (match.momentum === 'home') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (match.momentum === 'away') return <TrendingDown className="w-5 h-5 text-rose-400" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-400';
    if (confidence >= 60) return 'text-cyan-400';
    if (confidence >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-800/50 to-transparent border-b border-slate-700/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400">{match.league}</span>
            {match.status === 'live' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-rose-400">LIVE {match.minute}'</span>
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Teams & Score */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={match.homeTeamLogo || getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_TEAM_LOGO; }} />
                </div>
              </div>
              <p className="text-lg font-bold text-white">{match.homeTeam}</p>
              <p className="text-xs text-slate-500">Home</p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              {match.status === 'live' || match.status === 'finished' ? (
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-bold text-white">{match.homeScore}</span>
                  <span className="text-3xl text-slate-500">-</span>
                  <span className="text-5xl font-bold text-white">{match.awayScore}</span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-2xl font-bold text-slate-400">VS</span>
                  <p className="text-sm text-slate-500 mt-2">
                    {new Date(match.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-lg font-bold text-cyan-400">
                    {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-3">
                {getMomentumIcon()}
                <span className="text-sm text-slate-400">
                  {match.momentum === 'home' ? 'Home Momentum' : match.momentum === 'away' ? 'Away Momentum' : 'Balanced'}
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={match.awayTeamLogo || getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_TEAM_LOGO; }} />
                </div>
              </div>
              <p className="text-lg font-bold text-white">{match.awayTeam}</p>
              <p className="text-xs text-slate-500">Away</p>
            </div>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-semibold text-white">AI Prediction Analysis</span>
              </div>
              <span className={`text-lg font-bold ${getConfidenceColor(prediction?.confidence || 0)}`}>
                {hasPrediction ? `${prediction?.confidence}% Confidence` : 'Pending'}
              </span>
            </div>

            {/* Prediction Bars */}
            {hasPrediction ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Home Win</span>
                    <span className="text-emerald-400 font-medium">{prediction?.homeWin}%</span>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${prediction?.homeWin || 0}%` }}
                    />
                  </div>
                </div>
                {(prediction?.draw || 0) > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Draw</span>
                      <span className="text-slate-300 font-medium">{prediction?.draw}%</span>
                    </div>
                    <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full transition-all"
                        style={{ width: `${prediction?.draw || 0}%` }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Away Win</span>
                    <span className="text-rose-400 font-medium">{prediction?.awayWin}%</span>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                      style={{ width: `${prediction?.awayWin || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Prediction is not available for this match yet.</div>
            )}
          </div>
        </div>

        {/* Live Stats */}
        {match.status === 'live' && hasLiveStats && (
          <div className="px-6 pb-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-white">Live Statistics</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Possession" home={match.keyStats!.possession[0]} away={match.keyStats!.possession[1]} suffix="%" />
                <StatItem label="Shots" home={match.keyStats!.shots[0]} away={match.keyStats!.shots[1]} />
                <StatItem label="On Target" home={match.keyStats!.shotsOnTarget[0]} away={match.keyStats!.shotsOnTarget[1]} />
                <StatItem label="Corners" home={match.keyStats!.corners[0]} away={match.keyStats!.corners[1]} />
              </div>
            </div>
          </div>
        )}

        {/* Betting Options */}
        <div className="p-6 bg-slate-800/30 border-t border-slate-700/30">
          <p className="text-sm text-slate-400 mb-3">Select your prediction:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onSelectPrediction?.(match.id, 'home')}
              disabled={!odds?.homeWin}
              className="py-3 px-4 rounded-xl bg-slate-700/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-600 text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="block text-xs text-slate-400 group-hover:text-white/80 mb-1">Home Win</span>
              <span className="block text-xl font-bold text-white">{odds?.homeWin ? odds.homeWin.toFixed(2) : 'N/A'}</span>
            </button>
            <button
              onClick={() => onSelectPrediction?.(match.id, 'draw')}
              disabled={!odds?.draw}
              className="py-3 px-4 rounded-xl bg-slate-700/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-600 text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="block text-xs text-slate-400 group-hover:text-white/80 mb-1">Draw</span>
              <span className="block text-xl font-bold text-white">{odds?.draw ? odds.draw.toFixed(2) : 'N/A'}</span>
            </button>
            <button
              onClick={() => onSelectPrediction?.(match.id, 'away')}
              disabled={!odds?.awayWin}
              className="py-3 px-4 rounded-xl bg-slate-700/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-600 text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="block text-xs text-slate-400 group-hover:text-white/80 mb-1">Away Win</span>
              <span className="block text-xl font-bold text-white">{odds?.awayWin ? odds.awayWin.toFixed(2) : 'N/A'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; home: number; away: number; suffix?: string }> = ({ label, home, away, suffix = '' }) => {
  const total = home + away || 1;
  const homePercent = (home / total) * 100;

  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <p className="text-xs text-slate-500 text-center mb-2">{label}</p>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-cyan-400">{home}{suffix}</span>
        <span className="text-sm font-bold text-rose-400">{away}{suffix}</span>
      </div>
      <div className="h-1.5 bg-slate-600/50 rounded-full overflow-hidden flex">
        <div className="h-full bg-cyan-400" style={{ width: `${homePercent}%` }} />
        <div className="h-full bg-rose-400" style={{ width: `${100 - homePercent}%` }} />
      </div>
    </div>
  );
};

export default MatchDetailModal;
