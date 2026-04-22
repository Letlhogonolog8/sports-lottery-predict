import React, { useMemo } from 'react';
import { LotteryDraw } from '@/lib/sportsData';
import { Flame, Snowflake } from 'lucide-react';

interface FrequencyHeatmapProps {
  draw: LotteryDraw;
}

const FrequencyHeatmap: React.FC<FrequencyHeatmapProps> = ({ draw }) => {
  const { maxFreq, minFreq } = useMemo(() => {
    const frequencies = draw.frequencyData.map(d => d.frequency);
    return {
      maxFreq: Math.max(...frequencies),
      minFreq: Math.min(...frequencies),
    };
  }, [draw]);

  const getHeatColor = (frequency: number) => {
    const range = maxFreq - minFreq;
    const normalized = range > 0 ? (frequency - minFreq) / range : 0.5;
    
    if (normalized >= 0.8) return 'bg-rose-500/80 text-white';
    if (normalized >= 0.6) return 'bg-orange-500/70 text-white';
    if (normalized >= 0.4) return 'bg-amber-500/60 text-slate-900';
    if (normalized >= 0.2) return 'bg-cyan-500/50 text-white';
    return 'bg-blue-500/40 text-white';
  };

  const getHeatLabel = (frequency: number) => {
    const range = maxFreq - minFreq;
    const normalized = range > 0 ? (frequency - minFreq) / range : 0.5;
    
    if (normalized >= 0.8) return 'Very Hot';
    if (normalized >= 0.6) return 'Hot';
    if (normalized >= 0.4) return 'Warm';
    if (normalized >= 0.2) return 'Cool';
    return 'Cold';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Frequency Heatmap</h3>
            <p className="text-xs text-slate-400 mt-1">{draw.name} - Historical Analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-slate-400">Hot</span>
            </div>
            <div className="flex items-center gap-1">
              <Snowflake className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Cold</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Legend */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <span className="text-xs text-slate-500">Cold</span>
          <div className="flex gap-0.5">
            <div className="w-6 h-3 bg-blue-500/40 rounded-sm" />
            <div className="w-6 h-3 bg-cyan-500/50 rounded-sm" />
            <div className="w-6 h-3 bg-amber-500/60 rounded-sm" />
            <div className="w-6 h-3 bg-orange-500/70 rounded-sm" />
            <div className="w-6 h-3 bg-rose-500/80 rounded-sm" />
          </div>
          <span className="text-xs text-slate-500">Hot</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-10 gap-1">
          {draw.frequencyData.map((item) => (
            <div
              key={item.number}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 ${getHeatColor(item.frequency)}`}
              title={`Number ${item.number}: ${item.frequency} appearances (${getHeatLabel(item.frequency)})`}
            >
              <span className="text-xs font-bold">{item.number}</span>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Most Frequent</p>
            <div className="flex items-center justify-center gap-1">
              {draw.hotNumbers.slice(0, 3).map(num => (
                <span key={num} className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/30 text-rose-400 text-xs font-bold">
                  {num}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Least Frequent</p>
            <div className="flex items-center justify-center gap-1">
              {draw.coldNumbers.slice(0, 3).map(num => (
                <span key={num} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/30 text-blue-400 text-xs font-bold">
                  {num}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Avg Frequency</p>
            <p className="text-lg font-bold text-cyan-400">
              {Math.round(draw.frequencyData.reduce((a, b) => a + b.frequency, 0) / draw.frequencyData.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyHeatmap;
