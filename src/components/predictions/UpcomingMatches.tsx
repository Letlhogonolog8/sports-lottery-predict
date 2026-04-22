import React, { useState } from 'react';
import { Match } from '@/lib/sportsData';
import { Calendar, Clock, Zap, ChevronRight, Filter } from 'lucide-react';
import { getTeamLogo, DEFAULT_TEAM_LOGO } from '@/lib/teamLogos';

interface UpcomingMatchesProps {
  matches: Match[];
  onSelectMatch?: (match: Match) => void;
}

const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({ matches, onSelectMatch }) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

  const filteredMatches = matches.filter(match => {
    const confidence = match.prediction?.confidence;
    if (filter === 'high') return typeof confidence === 'number' && confidence >= 70;
    if (filter === 'medium') return typeof confidence === 'number' && confidence >= 50 && confidence < 70;
    return true;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (confidence >= 50) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Upcoming Matches</h3>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'high' | 'medium')}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Confidence</option>
              <option value="high">High (70%+)</option>
              <option value="medium">Medium (50-70%)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-700/30 max-h-[500px] overflow-y-auto">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            onClick={() => onSelectMatch?.(match)}
            className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{match.league}</span>
                {typeof match.prediction?.confidence === 'number' ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getConfidenceColor(match.prediction.confidence)}`}>
                    {match.prediction.confidence}% AI
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border text-slate-400 bg-slate-500/20 border-slate-500/30">
                    Pending AI
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(match.startTime)}</span>
                <span>{formatTime(match.startTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 overflow-hidden">
                    <img src={match.homeTeamLogo || getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_TEAM_LOGO; }} />
                  </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{match.homeTeam}</p>
                  <p className="text-xs text-slate-500">Home</p>
                </div>
              </div>

              <div className="px-4 text-center">
                <span className="text-lg font-bold text-slate-400">VS</span>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-medium text-white truncate">{match.awayTeam}</p>
                  <p className="text-xs text-slate-500">Away</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-700/50 overflow-hidden">
                  <img src={match.awayTeamLogo || getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_TEAM_LOGO; }} />
                </div>
              </div>
            </div>

            {/* Prediction Preview */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                  1: {match.odds?.homeWin ? match.odds.homeWin.toFixed(2) : 'N/A'}
                </span>
                <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                  X: {match.odds?.draw ? match.odds.draw.toFixed(2) : 'N/A'}
                </span>
                <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                  2: {match.odds?.awayWin ? match.odds.awayWin.toFixed(2) : 'N/A'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* AI Recommendation */}
            {typeof match.prediction?.confidence === 'number' && match.prediction.confidence >= 65 && (
              <div className="mt-3 p-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400">
                  AI recommends: {match.prediction.homeWin > match.prediction.awayWin ? 'Home Win' : 'Away Win'} ({Math.max(match.prediction.homeWin, match.prediction.awayWin)}%)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-slate-500">No matches found with selected filter</p>
        </div>
      )}

      <div className="p-4 bg-slate-800/30 border-t border-slate-700/30">
        <button className="w-full py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-sm text-slate-300 transition-colors flex items-center justify-center gap-2">
          View All Upcoming Matches
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UpcomingMatches;
