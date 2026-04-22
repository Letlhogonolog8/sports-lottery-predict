import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, ChevronRight, Play, Shield, Award } from 'lucide-react';
import { getPlatformStats } from '@/lib/supabase';

interface HeroBannerProps {
  onGetStarted?: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ onGetStarted }) => {
  const [currentStat, setCurrentStat] = useState(0);
  const [platformAccuracy, setPlatformAccuracy] = useState(0);
  const [platformPredictions, setPlatformPredictions] = useState(0);
  const [platformLiveMatches, setPlatformLiveMatches] = useState(0);
  const [todayPredictions, setTodayPredictions] = useState(0);
  const [topSport, setTopSport] = useState('N/A');

  const stats = [
    { value: `${platformAccuracy.toFixed(1)}%`, label: 'Prediction Accuracy' },
    { value: platformPredictions.toLocaleString(), label: 'Settled Predictions' },
    { value: todayPredictions.toLocaleString(), label: 'Predictions Today' },
  ];

  useEffect(() => {
    const loadPlatformStats = async () => {
      try {
        const data = await getPlatformStats();
        setPlatformAccuracy(data.accuracy || 0);
        setPlatformPredictions(data.totalPredictions || 0);
        setPlatformLiveMatches(data.activeLiveMatches || 0);
        setTodayPredictions(data.todayPredictions || 0);
        setTopSport(data.topSport || 'N/A');
      } catch (error) {
        console.error('Error loading hero stats:', error);
      }
    };

    loadPlatformStats();

    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
      </div>

      <div className="relative z-10 p-6 lg:p-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-medium text-cyan-400">
                AI-Powered
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Predict Sports Outcomes with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Precision
              </span>
            </h1>

            <p className="text-slate-400 text-lg mb-6 max-w-lg">
              Leverage advanced machine learning models analyzing millions of data points 
              to predict match outcomes with unprecedented accuracy.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
              >
                Get Started
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Secure & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-400">Industry Leading</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-slate-400">Real-Time Updates</span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 lg:p-8">
              {/* Animated Stat Display */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
                  <TrendingUp className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="h-20 flex flex-col items-center justify-center">
                  <p className="text-4xl lg:text-5xl font-bold text-white transition-all duration-500">
                    {stats[currentStat].value}
                  </p>
                  <p className="text-slate-400 mt-2">{stats[currentStat].label}</p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {stats.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStat(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStat ? 'bg-cyan-400 w-6' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">{todayPredictions}</p>
                  <p className="text-xs text-slate-500">Today</p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-cyan-400 capitalize">{topSport}</p>
                  <p className="text-xs text-slate-500">Top Sport</p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-400">{platformLiveMatches}</p>
                  <p className="text-xs text-slate-500">Live Now</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 flex items-center justify-center animate-bounce">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
