import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBetSlips, getUserStats } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface BetSlip {
  id: string;
  prediction_type: string;
  odds: number;
  stake: number;
  status: string;
  result: string;
  profit_loss: number;
  created_at: string;
  matches: any;
}

export default function PredictionHistory() {
  const { user, profile } = useAuth();
  const [betSlips, setBetSlips] = useState<BetSlip[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch bet slips
        const bets = await getUserBetSlips(user.id);
        setBetSlips(bets || []);

        // Fetch stats
        const userStats = await getUserStats(user.id);
        setStats(userStats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredBets = activeTab === 'all' ? betSlips : betSlips.filter(b => b.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/20 text-green-700';
      case 'lost':
        return 'bg-red-500/20 text-red-700';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getPredictionLabel = (type: string) => {
    const labels: Record<string, string> = {
      home_win: 'Home Win',
      draw: 'Draw',
      away_win: 'Away Win',
      over_goals: 'Over 2.5 Goals',
      under_goals: 'Under 2.5 Goals',
      btts: 'Both Teams to Score'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_predictions ?? profile?.total_predictions ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.wins ?? profile?.wins ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.losses ?? profile?.losses ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.accuracy_percentage ?? profile?.accuracy_percentage ?? 0).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Bet Slips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
          <CardDescription>Your saved predictions and bet slips</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredBets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {activeTab !== 'all' ? activeTab : ''} predictions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Prediction</TableHead>
                        <TableHead>Odds</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>P/L</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBets.map((bet) => (
                        <TableRow key={bet.id}>
                          <TableCell className="font-medium">
                            {bet.matches?.home_team_name} vs {bet.matches?.away_team_name}
                          </TableCell>
                          <TableCell>{getPredictionLabel(bet.prediction_type)}</TableCell>
                          <TableCell>{bet.odds.toFixed(2)}</TableCell>
                          <TableCell>${bet.stake?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(bet.status)}>
                              {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className={bet.profit_loss && bet.profit_loss > 0 ? 'text-green-600' : 'text-red-600'}>
                            {bet.profit_loss ? `$${bet.profit_loss.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>{format(new Date(bet.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
