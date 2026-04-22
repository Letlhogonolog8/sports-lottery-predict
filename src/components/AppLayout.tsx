import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, getLiveMatches, getUpcomingMatches, getAllLotteryDrawsWithDetails, getLatestMatchPredictions } from '@/lib/supabase';
import { getTeamLogo } from '@/lib/teamLogos';

// Components
import Header from '@/components/predictions/Header';
import HeroBanner from '@/components/predictions/HeroBanner';
import TabNavigation, { TabType } from '@/components/predictions/TabNavigation';
import LiveMatchCard from '@/components/predictions/LiveMatchCard';
import UpcomingMatches from '@/components/predictions/UpcomingMatches';
import LotteryModule from '@/components/predictions/LotteryModule';
import FrequencyHeatmap from '@/components/predictions/FrequencyHeatmap';
import PatternAnalysis from '@/components/predictions/PatternAnalysis';
import StatsOverview from '@/components/predictions/StatsOverview';
import PredictionEngine from '@/components/predictions/PredictionEngine';
import SportsCategories from '@/components/predictions/SportsCategories';
import LeagueSelector from '@/components/predictions/LeagueSelector';
import SettingsPanel from '@/components/predictions/SettingsPanel';
import Footer from '@/components/predictions/Footer';
import { X, Menu, Zap, Activity, ChevronRight } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPredictions, setSelectedPredictions] = useState<Map<string, string>>(new Map());
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [lotteryDrawsData, setLotteryDrawsData] = useState<any[]>([]);

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dataError, setDataError] = useState<string | null>(null);

  const pollIntervalMs = Number(import.meta.env.VITE_LIVE_REFRESH_MS || 60000);

  const normalizeSportKey = (value: string) => {
    const normalized = (value || 'unknown').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (normalized === 'americanfootball') return 'american_football';
    return normalized;
  };

  const isLikelyPlaceholderMatch = (match: any) => {
    const values = [
      match?.league,
      match?.home_team_name,
      match?.away_team_name,
      match?.homeTeam,
      match?.awayTeam,
      match?.match_id,
      match?.id,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return values.some((value) => value.includes('test match') || value.startsWith('test_') || value.includes('demo'));
  };

  useEffect(() => {
    let isMounted = true;
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const transformMatches = (matches: any[], predictionsByMatchId: Record<string, any>) => {
      return (matches || [])
        .filter((match) => !isLikelyPlaceholderMatch(match))
        .map((match) => {
          const homeTeamName = match.home_team_name || match.homeTeam || 'Home Team';
          const awayTeamName = match.away_team_name || match.awayTeam || 'Away Team';

          const predictionRow = predictionsByMatchId[match.id] || null;
          const prediction = predictionRow
            ? {
                homeWin: Number(predictionRow.home_win_probability) || 0,
                draw: Number(predictionRow.draw_probability) || 0,
                awayWin: Number(predictionRow.away_win_probability) || 0,
                confidence: Number(predictionRow.confidence_score) || 0,
              }
            : null;

          const odds = prediction
            ? {
                homeWin: prediction.homeWin > 0 ? Number((100 / prediction.homeWin).toFixed(2)) : null,
                draw: prediction.draw > 0 ? Number((100 / prediction.draw).toFixed(2)) : null,
                awayWin: prediction.awayWin > 0 ? Number((100 / prediction.awayWin).toFixed(2)) : null,
              }
            : null;

          const hasLiveStats = [
            match.possession_home,
            match.possession_away,
            match.shots_home,
            match.shots_away,
            match.shots_on_target_home,
            match.shots_on_target_away,
            match.corners_home,
            match.corners_away,
          ].every((value) => typeof value === 'number');

          return {
            id: match.id || match.match_id,
            sport: normalizeSportKey(match.sport || 'unknown'),
            league: match.league || 'Unknown League',
            homeTeam: homeTeamName,
            awayTeam: awayTeamName,
            homeTeamLogo: match.home_team?.logo_url || match.homeTeamLogo || getTeamLogo(homeTeamName),
            awayTeamLogo: match.away_team?.logo_url || match.awayTeamLogo || getTeamLogo(awayTeamName),
            homeScore: match.home_score,
            awayScore: match.away_score,
            startTime: match.start_time || match.startTime,
            status: match.status || 'upcoming',
            minute: match.minute,
            prediction,
            odds,
            momentum:
              typeof match.home_score === 'number' && typeof match.away_score === 'number'
                ? match.home_score > match.away_score
                  ? 'home'
                  : match.home_score < match.away_score
                    ? 'away'
                    : 'neutral'
                : 'neutral',
            keyStats: hasLiveStats
              ? {
                  possession: [match.possession_home, match.possession_away],
                  shots: [match.shots_home, match.shots_away],
                  shotsOnTarget: [match.shots_on_target_home, match.shots_on_target_away],
                  corners: [match.corners_home, match.corners_away],
                }
              : null,
          };
        });
    };

    const fetchData = async () => {
      const [liveResult, upcomingResult, lotteryResult] = await Promise.allSettled([
        getLiveMatches(),
        getUpcomingMatches(),
        getAllLotteryDrawsWithDetails(),
      ]);

      if (!isMounted) return;

      const live = liveResult.status === 'fulfilled' ? (liveResult.value ?? []) : [];
      const upcoming = upcomingResult.status === 'fulfilled' ? (upcomingResult.value ?? []) : [];
      const lottery = lotteryResult.status === 'fulfilled' ? (lotteryResult.value ?? []) : [];

      if (liveResult.status === 'rejected') {
        console.error('[AppLayout] getLiveMatches error:', liveResult.reason);
      }
      if (upcomingResult.status === 'rejected') {
        console.error('[AppLayout] getUpcomingMatches error:', upcomingResult.reason);
      }
      if (lotteryResult.status === 'rejected') {
        console.error('[AppLayout] getAllLotteryDrawsWithDetails error:', lotteryResult.reason);
      }

      const allMatchIds = [...live, ...upcoming].map((m) => m.id).filter(Boolean);
      let predictionsByMatchId: Record<string, any> = {};
      try {
        predictionsByMatchId = await getLatestMatchPredictions(allMatchIds);
      } catch (err) {
        console.error('[AppLayout] getLatestMatchPredictions error:', err);
      }

      if (!isMounted) return;

      const transformedLive = transformMatches(live, predictionsByMatchId);
      const transformedUpcoming = transformMatches(upcoming, predictionsByMatchId);

      setLiveMatches(transformedLive);
      setUpcomingMatches(transformedUpcoming);
      setLotteryDrawsData(lottery);

      const anyFailed = liveResult.status === 'rejected' || upcomingResult.status === 'rejected';
      setDataError(anyFailed ? 'Some data feeds delayed. Retrying...' : null);
      setLastUpdate(new Date());
    };

    const scheduleRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(() => {
        fetchData();
      }, 500);
    };

    fetchData();

    const safePollInterval = Number.isFinite(pollIntervalMs) && pollIntervalMs > 0 ? pollIntervalMs : 60000;
    const interval = setInterval(() => {
      fetchData();
    }, safePollInterval);

    const matchesChannel = supabase
      .channel('app:matches:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, scheduleRefresh)
      .subscribe();

    const lotteryChannel = supabase
      .channel('app:lottery:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_draws' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_frequency' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_numbers' }, scheduleRefresh)
      .subscribe();

    return () => {
      isMounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      clearInterval(interval);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(lotteryChannel);
    };
  }, [pollIntervalMs]);

  const handleSelectPrediction = useCallback((matchId: string, prediction: string) => {
    const newPredictions = new Map(selectedPredictions);
    if (newPredictions.get(matchId) === prediction) {
      newPredictions.delete(matchId);
    } else {
      newPredictions.set(matchId, prediction);
    }
    setSelectedPredictions(newPredictions);
    if (newPredictions.size > 0) {
      setShowBetSlip(true);
    }
  }, [selectedPredictions]);

  const clearBetSlip = useCallback(() => {
    setSelectedPredictions(new Map());
    setShowBetSlip(false);
  }, []);

  const filteredLiveMatches = liveMatches.filter(match => {
    if (selectedSport !== 'all' && match.sport !== selectedSport) return false;
    if (selectedLeague !== 'all' && match.league !== selectedLeague) return false;
    return true;
  });

  const filteredUpcomingMatches = upcomingMatches.filter(match => {
    if (selectedSport !== 'all' && match.sport !== selectedSport) return false;
    if (selectedLeague !== 'all' && match.league !== selectedLeague) return false;
    return true;
  });

  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    [...liveMatches, ...upcomingMatches].forEach((match) => {
      const sport = (match.sport || 'unknown').toLowerCase();
      counts[sport] = (counts[sport] || 0) + 1;
    });
    return counts;
  }, [liveMatches, upcomingMatches]);

  const topSports = useMemo(
    () => Object.entries(sportCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    [sportCounts]
  );

  const availableLeagues = useMemo(() => {
    const leagueMap = new Map<string, number>();
    [...liveMatches, ...upcomingMatches].forEach((match) => {
      leagueMap.set(match.league, (leagueMap.get(match.league) || 0) + 1);
    });
    return Array.from(leagueMap.entries())
      .map(([name, count]) => {
        const [countryCandidate] = String(name).split(' - ');
        const country = countryCandidate && countryCandidate !== name ? countryCandidate : 'Various';
        return { id: name, name, country, icon: '⚽', matchCount: count };
      })
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [liveMatches, upcomingMatches]);
  const totalAvailableMatches = liveMatches.length + upcomingMatches.length;

  const renderContent = () => {
    switch (activeTab) {
      case 'live':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Live Matches Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      <h2 className="text-xl font-bold text-white">Live Matches</h2>
                    </div>
                    <span className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-xs font-medium text-rose-400">
                      {filteredLiveMatches.length} Active
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">
                      Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                    {dataError && (
                      <span className="text-xs text-amber-400">{dataError}</span>
                    )}
                  </div>
                </div>

                {/* Live Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredLiveMatches.map((match) => (
                    <LiveMatchCard
                      key={match.id}
                      match={match}
                      onSelectPrediction={handleSelectPrediction}
                    />
                  ))}
                </div>

                {filteredLiveMatches.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No live matches for selected sport</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <LeagueSelector
                selectedLeague={selectedLeague}
                onSelectLeague={setSelectedLeague}
                leagues={availableLeagues}
                totalMatches={totalAvailableMatches}
              />
            </div>
          </div>
        );

      case 'upcoming':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UpcomingMatches
                matches={filteredUpcomingMatches}
                onSelectMatch={() => {}}
              />
            </div>
            <div className="space-y-6">
               <LeagueSelector
                 selectedLeague={selectedLeague}
                 onSelectLeague={setSelectedLeague}
                 leagues={availableLeagues}
                 totalMatches={totalAvailableMatches}
               />
             </div>
          </div>
        );

      case 'lottery':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LotteryModule draws={lotteryDrawsData} />
              <div className="space-y-6">
                {lotteryDrawsData.length > 0 && (
                  <>
                    <FrequencyHeatmap draw={lotteryDrawsData[0]} />
                    <PatternAnalysis draw={lotteryDrawsData[0]} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'stats':
        return <StatsOverview />;

      case 'engine':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PredictionEngine />
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-bold text-white mb-4">Live Coverage by Sport</h3>
                <div className="space-y-3">
                  {topSports.length > 0 ? (
                    topSports.map(([sport, count]) => {
                      const total = Math.max(1, [...liveMatches, ...upcomingMatches].length);
                      const coverage = Math.round((count / total) * 100);
                      return (
                        <div key={sport}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 capitalize">{sport}</span>
                            <span className="text-cyan-400 font-medium">{count} matches</span>
                          </div>
                          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: `${coverage}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-500">No match coverage data available yet.</div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-bold text-white mb-4">Data Pipeline Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dataError ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                      <span className="text-sm text-slate-300">Match Feed</span>
                    </div>
                    <span className="text-xs text-slate-500">{dataError ? 'Retrying' : 'Healthy'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-slate-300">Lottery Feed</span>
                    </div>
                    <span className="text-xs text-slate-500">{lotteryDrawsData.length} active draws</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-sm text-slate-300">Last Refresh</span>
                    </div>
                    <span className="text-xs text-slate-500">{lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <Header
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        menuOpen={mobileMenuOpen}
        liveCount={filteredLiveMatches.length}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-slate-900 border-r border-slate-700 p-4 animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">PredictAI</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <SportsCategories
              selectedSport={selectedSport}
              onSelectSport={(sport) => {
                setSelectedSport(sport);
                setMobileMenuOpen(false);
              }}
              sportCounts={sportCounts}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Hero Banner - Only on Live tab */}
        {activeTab === 'live' && (
          <div className="mb-6">
            <HeroBanner onGetStarted={() => setActiveTab('upcoming')} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} liveCount={filteredLiveMatches.length} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Desktop */}
          {activeTab !== 'settings' && (
            <div className="hidden lg:block space-y-6">
              <SportsCategories
                selectedSport={selectedSport}
                onSelectSport={setSelectedSport}
                sportCounts={sportCounts}
              />
            </div>
          )}

          {/* Content Area */}
          <div className={activeTab === 'settings' ? 'lg:col-span-4' : 'lg:col-span-3'}>
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating Bet Slip */}
      {showBetSlip && selectedPredictions.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-4 w-80 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white">Bet Slip</h4>
              <button onClick={clearBetSlip} className="text-slate-400 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {Array.from(selectedPredictions.entries()).map(([matchId, prediction]) => {
                const match = [...liveMatches, ...upcomingMatches].find(m => m.id === matchId);
                if (!match) return null;
                return (
                  <div key={matchId} className="p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-400 truncate">{match.homeTeam} vs {match.awayTeam}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-white font-medium">
                        {prediction === 'home' ? '1' : prediction === 'draw' ? 'X' : '2'}
                      </span>
                      <span className="text-sm text-cyan-400 font-bold">
                        {(() => {
                          const selectedOdds = prediction === 'home'
                            ? match.odds?.homeWin
                            : prediction === 'draw'
                              ? match.odds?.draw
                              : match.odds?.awayWin;
                          return selectedOdds ? `@${selectedOdds.toFixed(2)}` : 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mb-4 p-2 bg-slate-800/50 rounded-lg">
              <span className="text-xs text-slate-400">Total Odds</span>
              <span className="text-lg font-bold text-emerald-400">
                {Array.from(selectedPredictions.entries()).reduce((acc, [matchId, prediction]) => {
                  const match = [...liveMatches, ...upcomingMatches].find(m => m.id === matchId);
                  if (!match) return acc;
                  const odds = prediction === 'home' ? match.odds?.homeWin : prediction === 'draw' ? match.odds?.draw : match.odds?.awayWin;
                  return odds ? acc * odds : acc;
                }, 1).toFixed(2)}
              </span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-bold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2">
              Place Prediction
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppLayout;
