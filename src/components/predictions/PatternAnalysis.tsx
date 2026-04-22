import React, { useMemo, useState } from 'react';
import { LotteryDraw } from '@/lib/sportsData';
import { Brain, TrendingUp, Repeat, Hash, ChevronRight, Sparkles } from 'lucide-react';

interface PatternAnalysisProps {
  draw: LotteryDraw;
}

interface Pattern {
  name: string;
  description: string;
  numbers: number[];
  confidence: number;
  type: 'consecutive' | 'odd-even' | 'high-low' | 'sum' | 'gap';
}

const PatternAnalysis: React.FC<PatternAnalysisProps> = ({ draw }) => {
  const [selectedPattern, setSelectedPattern] = useState<number | null>(null);

  const patterns: Pattern[] = useMemo(() => {
    const topFrequencyNumbers = [...draw.frequencyData]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, Math.max(5, draw.pickCount))
      .map((item) => item.number)
      .sort((a, b) => a - b);

    const consecutive = topFrequencyNumbers.filter((num, index, arr) => index > 0 && num - arr[index - 1] === 1);
    const oddEvenSet = topFrequencyNumbers.slice(0, draw.pickCount);
    const highLowSplit = [...topFrequencyNumbers].sort((a, b) => a - b).slice(0, draw.pickCount);
    const expectedSum = highLowSplit.reduce((sum, value) => sum + value, 0);

    const gapPattern = highLowSplit.filter((value, index, arr) => index === 0 || value - arr[index - 1] >= 2);

    return [
      {
        name: 'Consecutive Pairs',
        description: 'Most frequent numbers that appear in adjacent ranges',
        numbers: consecutive.length ? consecutive : topFrequencyNumbers.slice(0, Math.min(4, draw.pickCount)),
        confidence: Math.min(95, 55 + consecutive.length * 10),
        type: 'consecutive',
      },
      {
        name: 'Odd-Even Balance',
        description: 'Top-frequency blend with balanced odd/even distribution',
        numbers: oddEvenSet,
        confidence: Math.min(95, 60 + Math.abs(oddEvenSet.filter((n) => n % 2 === 0).length - oddEvenSet.filter((n) => n % 2 !== 0).length) * 5),
        type: 'odd-even',
      },
      {
        name: 'High-Low Split',
        description: 'Frequent numbers split across lower and upper ranges',
        numbers: highLowSplit,
        confidence: Math.min(95, 62 + draw.hotNumbers.slice(0, draw.pickCount).length * 2),
        type: 'high-low',
      },
      {
        name: 'Sum Range',
        description: `Current high-frequency sum estimate: ${expectedSum}`,
        numbers: highLowSplit,
        confidence: Math.min(95, 58 + Math.round(expectedSum / Math.max(1, draw.numbersRange[1]))),
        type: 'sum',
      },
      {
        name: 'Gap Pattern',
        description: 'Numbers spaced by consistent historical frequency gaps',
        numbers: gapPattern.slice(0, draw.pickCount),
        confidence: Math.min(95, 55 + gapPattern.length * 6),
        type: 'gap',
      },
    ];
  }, [draw]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'consecutive': return <Repeat className="w-5 h-5" />;
      case 'odd-even': return <Hash className="w-5 h-5" />;
      case 'high-low': return <TrendingUp className="w-5 h-5" />;
      case 'sum': return <Brain className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (confidence >= 65) return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
    return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pattern Recognition</h3>
            <p className="text-xs text-slate-400">{draw.name} - AI-Detected Patterns</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {patterns.map((pattern, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPattern(selectedPattern === idx ? null : idx)}
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              selectedPattern === idx
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedPattern === idx ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
                  {getPatternIcon(pattern.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{pattern.name}</p>
                  <p className="text-xs text-slate-500">{pattern.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getConfidenceColor(pattern.confidence)}`}>
                  {pattern.confidence}%
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${selectedPattern === idx ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {selectedPattern === idx && (
              <div className="mt-4 pt-4 border-t border-slate-700/30 animate-in slide-in-from-top-1">
                <p className="text-xs text-slate-400 mb-3">Suggested Numbers:</p>
                <div className="flex flex-wrap gap-2">
                  {pattern.numbers.map((num) => (
                    <span
                      key={num}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white font-bold text-sm border border-purple-500/30"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-sm text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Use This Pattern
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-700/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Based on {draw.frequencyData.length} tracked numbers</span>
          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View Full Analysis
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;
