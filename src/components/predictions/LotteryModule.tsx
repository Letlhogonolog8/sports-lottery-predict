import React, { useState, useMemo } from 'react';
import { LotteryDraw } from '@/lib/sportsData';
import { Sparkles, Clock, Trophy, TrendingUp, TrendingDown, Shuffle, Check, X, Info } from 'lucide-react';

interface LotteryModuleProps {
  draws: LotteryDraw[];
}

const LotteryModule: React.FC<LotteryModuleProps> = ({ draws }) => {
  const [selectedDraw, setSelectedDraw] = useState<LotteryDraw | null>(draws[0] || null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  React.useEffect(() => {
    if (!selectedDraw && draws.length > 0) {
      setSelectedDraw(draws[0]);
    }
  }, [draws, selectedDraw]);

  const toggleNumber = (num: number) => {
    if (!selectedDraw) return;

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < selectedDraw.pickCount) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const quickPick = () => {
    if (!selectedDraw) return;

    const numbers: number[] = [];
    while (numbers.length < selectedDraw.pickCount) {
      const rand = Math.floor(Math.random() * (selectedDraw.numbersRange[1] - selectedDraw.numbersRange[0] + 1)) + selectedDraw.numbersRange[0];
      if (!numbers.includes(rand)) {
        numbers.push(rand);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const smartPick = () => {
    if (!selectedDraw) return;

    const hotPool = [...selectedDraw.hotNumbers];
    const numbers: number[] = [];
    
    // Pick 60% from hot numbers
    const hotCount = Math.ceil(selectedDraw.pickCount * 0.6);
    for (let i = 0; i < hotCount && hotPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * hotPool.length);
      numbers.push(hotPool.splice(idx, 1)[0]);
    }
    
    // Fill rest randomly
    while (numbers.length < selectedDraw.pickCount) {
      const rand = Math.floor(Math.random() * (selectedDraw.numbersRange[1] - selectedDraw.numbersRange[0] + 1)) + selectedDraw.numbersRange[0];
      if (!numbers.includes(rand)) {
        numbers.push(rand);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const clearSelection = () => setSelectedNumbers([]);

  const getNumberType = (num: number): 'hot' | 'cold' | 'neutral' => {
    if (!selectedDraw) return 'neutral';
    if (selectedDraw.hotNumbers.includes(num)) return 'hot';
    if (selectedDraw.coldNumbers.includes(num)) return 'cold';
    return 'neutral';
  };

  const getNumberStyle = (num: number, isSelected: boolean) => {
    const type = getNumberType(num);
    if (isSelected) {
      return 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-110';
    }
    if (type === 'hot') {
      return 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 hover:border-amber-400';
    }
    if (type === 'cold') {
      return 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30 hover:border-blue-400';
    }
    return 'bg-slate-800/50 text-slate-300 border-slate-600/30 hover:border-slate-500';
  };

  const predictionScore = useMemo(() => {
    if (!selectedDraw || selectedNumbers.length < 2 || selectedDraw.frequencyData.length === 0) return null;

    const frequencyByNumber = new Map(selectedDraw.frequencyData.map((item) => [item.number, item.frequency]));
    const frequencies = selectedNumbers
      .map((num) => frequencyByNumber.get(num))
      .filter((value): value is number => typeof value === 'number');

    if (!frequencies.length) return null;

    const maxFreq = Math.max(...selectedDraw.frequencyData.map((item) => item.frequency));
    const minFreq = Math.min(...selectedDraw.frequencyData.map((item) => item.frequency));
    const selectedAvg = frequencies.reduce((sum, value) => sum + value, 0) / frequencies.length;
    const normalized = maxFreq > minFreq ? (selectedAvg - minFreq) / (maxFreq - minFreq) : 0.5;
    const score = 25 + normalized * 70;

    return Math.round(Math.max(25, Math.min(score, 95)));
  }, [selectedNumbers, selectedDraw]);

  const timeUntilDraw = useMemo(() => {
    if (!selectedDraw) return 'TBD';

    const now = new Date();
    const draw = new Date(selectedDraw.nextDraw);
    const diff = draw.getTime() - now.getTime();
    
    if (diff <= 0) return 'Drawing now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [selectedDraw]);

  if (!selectedDraw) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-slate-400">
        No lottery data available.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-slate-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Lottery Intelligence</h3>
              <p className="text-xs text-slate-400">AI-Powered Number Analysis</p>
            </div>
          </div>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
          >
            <Info className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Lottery Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {draws.map(draw => (
            <button
              key={draw.id}
              onClick={() => {
                setSelectedDraw(draw);
                setSelectedNumbers([]);
              }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                selectedDraw.id === draw.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {draw.name}
            </button>
          ))}
        </div>
      </div>

      {/* Draw Info */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Jackpot</span>
            </div>
            <p className="text-xl font-bold text-white">{selectedDraw.jackpot}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Next Draw</span>
            </div>
            <p className="text-xl font-bold text-white">{timeUntilDraw}</p>
          </div>
        </div>
      </div>

      {/* Hot/Cold Numbers */}
      {showAnalysis && (
        <div className="p-4 border-b border-slate-700/30 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Hot Numbers</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDraw.hotNumbers.map(num => (
                  <span key={num} className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold">
                    {num}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">Cold Numbers</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDraw.coldNumbers.map(num => (
                  <span key={num} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 text-sm font-bold">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Grid */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">
            Select {selectedDraw.pickCount} numbers ({selectedNumbers.length}/{selectedDraw.pickCount})
          </span>
          <div className="flex gap-2">
            <button
              onClick={quickPick}
              className="px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              Quick Pick
            </button>
            <button
              onClick={smartPick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-xs text-purple-300 flex items-center gap-1 transition-colors border border-purple-500/30"
            >
              <Sparkles className="w-3 h-3" />
              Smart Pick
            </button>
            {selectedNumbers.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs text-rose-300 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1.5 max-h-64 overflow-y-auto p-1">
          {Array.from({ length: selectedDraw.numbersRange[1] }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              disabled={selectedNumbers.length >= selectedDraw.pickCount && !selectedNumbers.includes(num)}
              className={`w-full aspect-square rounded-lg text-sm font-bold border transition-all duration-200 ${getNumberStyle(num, selectedNumbers.includes(num))} ${
                selectedNumbers.length >= selectedDraw.pickCount && !selectedNumbers.includes(num) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Numbers & Prediction */}
      {selectedNumbers.length >= 2 && (
        <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Your Selection</span>
              <div className="flex gap-2">
                {selectedNumbers.sort((a, b) => a - b).map(num => (
                  <span key={num} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/25">
                    {num}
                  </span>
                ))}
                {Array.from({ length: selectedDraw.pickCount - selectedNumbers.length }).map((_, i) => (
                  <span key={`empty-${i}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700/50 border-2 border-dashed border-slate-600 text-slate-500">
                    ?
                  </span>
                ))}
              </div>
            </div>
            {predictionScore && (
              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">AI Score</span>
                <div className={`text-2xl font-bold ${
                  predictionScore >= 70 ? 'text-emerald-400' : predictionScore >= 50 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {predictionScore}%
                </div>
              </div>
            )}
          </div>

          {selectedNumbers.length === selectedDraw.pickCount && (
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Confirm Selection
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LotteryModule;
