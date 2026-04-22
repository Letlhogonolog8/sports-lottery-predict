import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Database, Zap, RefreshCw, ChevronRight, Activity, Target, TrendingUp } from 'lucide-react';
import { getPlatformStats } from '@/lib/supabase';

interface PredictionEngineProps {
  onRefresh?: () => void;
}

const PredictionEngine: React.FC<PredictionEngineProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const loadStats = async () => {
      try {
        const platformStats = await getPlatformStats();
        setStats(platformStats);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const platformStats = await getPlatformStats();
      setStats(platformStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setIsRefreshing(false);
      onRefresh?.();
    }
  };

  const modelMetrics = [
    { label: 'Model Accuracy', value: `${stats?.accuracy || 0}%`, icon: Target, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/20' },
    { label: 'Data Points', value: (stats?.totalPredictions || 0).toLocaleString(), icon: Database, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-600/20' },
    { label: 'Last Update', value: lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: RefreshCw, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/20' },
    { label: 'Weekly Accuracy', value: `${stats?.weeklyAccuracy || 0}%`, icon: Cpu, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/20' },
  ];

  const modelFactors = [
    { name: 'Overall Accuracy', weight: 45, value: Number(stats?.accuracy || 0) },
    { name: 'Weekly Accuracy', weight: 35, value: Number(stats?.weeklyAccuracy || 0) },
    {
      name: 'Realtime Coverage',
      weight: 20,
      value: stats?.activeLiveMatches ? Math.min(100, Number(stats.activeLiveMatches) * 10) : 0,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg relative">
              <Brain className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Prediction Engine</h3>
              <p className="text-xs text-slate-400">Live Platform Telemetry</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'text-cyan-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modelMetrics.map((metric, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${metric.bg} rounded-xl p-3 border border-slate-700/30`}>
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-slate-400">{metric.label}</span>
              </div>
              <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Factor Weights */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Model Input Factors
          </h4>
          <span className="text-xs text-slate-500">Weighted Contribution</span>
        </div>

        <div className="space-y-3">
          {modelFactors.map((factor, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedFactor(selectedFactor === idx ? null : idx)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selectedFactor === idx
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${selectedFactor === idx ? 'rotate-90' : ''}`} />
                  <span className="text-sm text-white">{factor.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{factor.weight}% weight</span>
                  <span className={`text-sm font-bold ${
                    factor.value >= 80 ? 'text-emerald-400' : factor.value >= 60 ? 'text-cyan-400' : 'text-amber-400'
                  }`}>
                    {factor.value}
                  </span>
                </div>
              </div>
              
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.value >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : factor.value >= 60
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${factor.value}%` }}
                />
              </div>

              {selectedFactor === idx && (
                <div className="mt-3 pt-3 border-t border-slate-700/30 animate-in slide-in-from-top-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This indicator is calculated from current platform data and contributes {factor.weight}%
                    to the runtime scoring profile. Current strength is {Math.round(factor.value)}%.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Model Status */}
      <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Model Active</span>
            </div>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">{stats?.activeLiveMatches || 0} Live Matches</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Real-time Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionEngine;
