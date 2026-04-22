import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMatchPrediction, predictMatch, saveBetSlip, savePredictionToHistory } from '@/lib/supabase';
import { betSlipSchema, matchPredictionRequestSchema, validateInput } from '@/lib/validation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, TrendingUp, Zap, Loader2 } from 'lucide-react';

interface Match {
  id: string;
  match_id: string;
  home_team_name: string;
  away_team_name: string;
  league: string;
  sport: string;
  start_time: string;
  status: string;
}

interface MatchPredictionCardProps {
  match: Match;
}

export default function MatchPredictionCard({ match }: MatchPredictionCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stake, setStake] = useState('10');
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const existingPrediction = await getMatchPrediction(match.id);
        if (existingPrediction) {
          setPrediction(existingPrediction);
        }
      } catch (error) {
        console.error('Error fetching prediction:', error);
      }
    };

    fetchPrediction();
  }, [match.id]);

  const generatePrediction = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to generate predictions',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const matchData = {
        matchId: match.match_id,
        homeTeam: match.home_team_name,
        awayTeam: match.away_team_name,
        league: match.league,
        sport: match.sport,
      };

      // Validate input
      const validation = validateInput(matchPredictionRequestSchema, matchData);
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.errors[0],
          variant: 'destructive'
        });
        return;
      }

      const result = await predictMatch(validation.data);
      setPrediction(result);
      toast({
        title: 'Prediction generated',
        description: 'AI analysis complete'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate prediction',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, match, toast]);

  const handleSaveBet = useCallback(async (predictionType: string, odds: number) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save predictions',
        variant: 'destructive'
      });
      return;
    }

    try {
      const stakeValue = parseFloat(stake);
      
      // Validate bet slip data
      const validation = validateInput(betSlipSchema, {
        matchId: match.id,
        predictionType,
        odds,
        stake: stakeValue,
      });

      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.errors[0],
          variant: 'destructive'
        });
        return;
      }

      await saveBetSlip(user.id, match.id, predictionType, odds, stakeValue);
      await savePredictionToHistory(
        user.id,
        match.sport,
        `${match.home_team_name} vs ${match.away_team_name}`,
        predictionType,
        prediction?.confidenceScore || 0,
        odds
      );

      setSelectedPrediction(predictionType);
      setStake('10');

      toast({
        title: 'Success',
        description: 'Prediction saved to your bet slip'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save prediction',
        variant: 'destructive'
      });
    }
  }, [user, match, stake, prediction, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {match.home_team_name} vs {match.away_team_name}
            </CardTitle>
            <CardDescription>{match.league}</CardDescription>
          </div>
          <Badge variant="outline">{match.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction ? (
          <Button
            onClick={generatePrediction}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Get AI Prediction'
            )}
          </Button>
        ) : (
          <>
            {/* Confidence Score */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${prediction.confidenceScore}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{prediction.confidenceScore.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Probabilities */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSaveBet('home_win', prediction.homeWinProbability)}
                className="p-3 rounded-lg border border-gray-700 hover:border-green-500 hover:bg-green-500/10 transition"
              >
                <div className="text-sm text-gray-400">{match.home_team_name}</div>
                <div className="text-2xl font-bold text-green-500">{prediction.homeWinProbability.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Home Win</div>
              </button>

              <button
                onClick={() => handleSaveBet('draw', prediction.drawProbability)}
                className="p-3 rounded-lg border border-gray-700 hover:border-yellow-500 hover:bg-yellow-500/10 transition"
              >
                <div className="text-sm text-gray-400">Draw</div>
                <div className="text-2xl font-bold text-yellow-500">{prediction.drawProbability.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Any Score</div>
              </button>

              <button
                onClick={() => handleSaveBet('away_win', prediction.awayWinProbability)}
                className="p-3 rounded-lg border border-gray-700 hover:border-red-500 hover:bg-red-500/10 transition"
              >
                <div className="text-sm text-gray-400">{match.away_team_name}</div>
                <div className="text-2xl font-bold text-red-500">{prediction.awayWinProbability.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Away Win</div>
              </button>
            </div>

            {/* Recommended Bet */}
            {prediction.recommendedBet && (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  Recommended: <span className="font-semibold">{prediction.recommendedBet.toUpperCase()}</span>
                </span>
              </div>
            )}

            {/* Key Factors */}
            {prediction.factorsAnalyzed && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Key Factors</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(prediction.factorsAnalyzed).map(([factor, value]: [string, any]) => (
                    <div key={factor} className="bg-gray-800/50 p-2 rounded text-xs">
                      <div className="text-gray-400 capitalize">{factor.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="font-semibold">{typeof value === 'number' ? value.toFixed(1) : value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bet Slip Form */}
            {selectedPrediction && (
              <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="text-sm font-medium">Stake Amount</div>
                <Input
                  type="number"
                  min="1"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="Enter stake"
                />
                <Button
                  onClick={() => {
                    if (selectedPrediction === 'home_win') {
                      handleSaveBet('home_win', prediction.homeWinProbability);
                    } else if (selectedPrediction === 'draw') {
                      handleSaveBet('draw', prediction.drawProbability);
                    } else {
                      handleSaveBet('away_win', prediction.awayWinProbability);
                    }
                  }}
                  className="w-full"
                >
                  Save to Bet Slip
                </Button>
              </div>
            )}

            <Button
              onClick={generatePrediction}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Regenerate Prediction
            </Button>
          </>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Predictions are for informational purposes. Always bet responsibly.</span>
        </div>
      </CardContent>
    </Card>
  );
}
