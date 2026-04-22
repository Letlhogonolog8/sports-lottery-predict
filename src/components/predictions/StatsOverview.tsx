import React, { useState, useEffect } from 'react';
import { getPlatformStats } from '@/lib/supabase';
import { Users, Activity, Target, Award, BarChart3, TrendingUp } from 'lucide-react';

const StatsOverview: React.FC = () => {
  const [platformStats, setPlatformStats] = useState<any>({
    totalPredictions: 0,
    accuracy: 0,
    activeLiveMatches: 0,
    usersOnline: 0,
    weeklyAccuracy: 0,
    monthlyProfit: '+0%',
    topSport: 'Football',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        console.error('Error loading platform stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const stats = [
    { label: 'Total Predictions', value: platformStats.totalPredictions.toLocaleString(), icon: BarChart3, color: 'text-cyan-400' },
    { label: 'Overall Accuracy', value: `${platformStats.accuracy}%`, icon: Target, color: 'text-emerald-400' },
    { label: 'Live Matches', value: platformStats.activeLiveMatches, icon: Activity, color: 'text-rose-400' },
    { label: 'Active Users (24h)', value: platformStats.usersOnline.toLocaleString(), icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="w-3 h-3" />
                Live Data
              </span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Weekly Performance</h4>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-emerald-400">{platformStats.weeklyAccuracy}%</p>
              <p className="text-xs text-slate-500">Accuracy Rate</p>
            </div>
            <div className="w-24 h-16">
              <div className="h-full w-full rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-end p-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500/60 to-cyan-400/80 rounded"
                  style={{ height: `${Math.max(4, Math.min(platformStats.weeklyAccuracy || 0, 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Monthly Profit</h4>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-emerald-400">{platformStats.monthlyProfit}</p>
              <p className="text-xs text-slate-500">ROI This Month</p>
            </div>
            <div className="w-24 h-16">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path
                  d="M0,40 Q10,35 20,38 T40,30 T60,25 T80,15 T100,10"
                  fill="none"
                  stroke="url(#profitGradient)"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="profitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Top Sport</h4>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-cyan-400">{platformStats.topSport}</p>
              <p className="text-xs text-slate-500">Highest Accuracy</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <span className="text-2xl">⚽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions - Load from Database */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Recent Predictions
          </h4>
        </div>
        <div className="divide-y divide-slate-700/30">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading predictions...</div>
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">
              View your recent predictions in the History section
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-800/30 border-t border-slate-700/30">
          <button className="w-full py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-sm text-slate-300 transition-colors">
            View All Predictions
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
