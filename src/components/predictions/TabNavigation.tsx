import React from 'react';
import { Activity, Calendar, Sparkles, BarChart3, Brain, Settings } from 'lucide-react';

export type TabType = 'live' | 'upcoming' | 'lottery' | 'stats' | 'engine' | 'settings';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  liveCount?: number;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'live', label: 'Live Matches', icon: Activity },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'lottery', label: 'Lottery', icon: Sparkles },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'engine', label: 'AI Engine', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, liveCount = 0 }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Prediction sections">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showLiveBadge = tab.id === 'live';

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {showLiveBadge && (
                <span className={`min-w-5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-center ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : liveCount > 0
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-700 text-slate-400'
                }`}>
                  {liveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
