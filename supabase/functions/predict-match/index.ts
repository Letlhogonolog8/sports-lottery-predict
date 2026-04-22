import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { getBearerToken, getCorsHeaders, healthResponse } from "../_shared/http.ts";

interface MatchData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  homeTeamStats?: {
    lastFiveWins: number;
    lastFiveDraws: number;
    lastFiveLosses: number;
    homeWins: number;
    homeDraws: number;
    homeLosses: number;
    goalsFor: number;
    goalsAgainst: number;
    formRating: number;
  };
  awayTeamStats?: {
    lastFiveWins: number;
    lastFiveDraws: number;
    lastFiveLosses: number;
    awayWins: number;
    awayDraws: number;
    awayLosses: number;
    goalsFor: number;
    goalsAgainst: number;
    formRating: number;
  };
}

interface PredictionResult {
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  confidenceScore: number;
  recommendedBet: string;
  factorsAnalyzed: Record<string, number>;
}

const rateLimitWindowSecs = Number(Deno.env.get("PREDICT_RATE_LIMIT_WINDOW_SECS") || 60);
const rateLimitMax = Number(Deno.env.get("PREDICT_RATE_LIMIT_MAX") || 20);

async function isRateLimitedByUser(
  adminClient: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await adminClient.rpc("check_and_increment_rate_limit", {
      p_user_id: userId,
      p_endpoint: "predict-match",
      p_window_secs: rateLimitWindowSecs,
      p_max_requests: rateLimitMax,
    });
    if (error) {
      console.error("Rate limit check error:", error.message);
      return false;
    }
    return data === false;
  } catch {
    return false;
  }
}

const validateMatchData = (matchData: MatchData): string | null => {
  if (!matchData.matchId || !matchData.homeTeam || !matchData.awayTeam || !matchData.league || !matchData.sport) {
    return "Missing required fields: matchId, homeTeam, awayTeam, league, sport";
  }

  if (matchData.homeTeam.length > 120 || matchData.awayTeam.length > 120 || matchData.league.length > 120 || matchData.sport.length > 60) {
    return "One or more fields exceed allowed length";
  }

  return null;
};

async function analyzeMatchWithGemini(matchData: MatchData): Promise<PredictionResult> {
  const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!googleApiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  const homeStats = matchData.homeTeamStats;
  const awayStats = matchData.awayTeamStats;

  const homeStatsBlock = homeStats
    ? `
Home Team Stats:
- Last 5 matches: ${homeStats.lastFiveWins}W ${homeStats.lastFiveDraws}D ${homeStats.lastFiveLosses}L
- Home record: ${homeStats.homeWins}W ${homeStats.homeDraws}D ${homeStats.homeLosses}L
- Goals for: ${homeStats.goalsFor}, Goals against: ${homeStats.goalsAgainst}
- Form rating: ${homeStats.formRating}/100`
    : `
Home Team Stats:
- Data unavailable from live feed`;

  const awayStatsBlock = awayStats
    ? `
Away Team Stats:
- Last 5 matches: ${awayStats.lastFiveWins}W ${awayStats.lastFiveDraws}D ${awayStats.lastFiveLosses}L
- Away record: ${awayStats.awayWins}W ${awayStats.awayDraws}D ${awayStats.awayLosses}L
- Goals for: ${awayStats.goalsFor}, Goals against: ${awayStats.goalsAgainst}
- Form rating: ${awayStats.formRating}/100`
    : `
Away Team Stats:
- Data unavailable from live feed`;

  const analysisPrompt = `
Analyze this sports match and provide win probability predictions:

Match: ${matchData.homeTeam} vs ${matchData.awayTeam}
League: ${matchData.league}
Sport: ${matchData.sport}${homeStatsBlock}${awayStatsBlock}

Provide your analysis in the following JSON format:
{
  "homeWinProbability": <number 0-100>,
  "drawProbability": <number 0-100>,
  "awayWinProbability": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "recommendedBet": "<home_win|draw|away_win|no_clear_winner>",
  "reasoning": "<brief explanation>",
  "keyFactors": {
    "formAdvantage": <number -100 to 100>,
    "homeAdvantage": <number -50 to 50>,
    "defensiveStrength": <number 0-100>,
    "offensiveStrength": <number 0-100>,
    "headToHeadTrend": <number -100 to 100>
  }
}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(Deno.env.get("GEMINI_TIMEOUT_MS") || 15000));

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": googleApiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorData}`);
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("No content in Gemini response");
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const prediction = JSON.parse(jsonMatch[0]);
    const homeWin = Number(prediction.homeWinProbability) || 0;
    const draw = Number(prediction.drawProbability) || 0;
    const awayWin = Number(prediction.awayWinProbability) || 0;
    const total = homeWin + draw + awayWin;

    if (total <= 0) {
      throw new Error("Invalid probability output from model");
    }

    const normalizer = 100 / total;
    const factorsAnalyzed = prediction.keyFactors || {};

    const calculatedFactors: Record<string, number> = {
      formAdvantage: Number(factorsAnalyzed.formAdvantage) || 0,
      homeAdvantage: Number(factorsAnalyzed.homeAdvantage) || 0,
      defensiveStrength: Number(factorsAnalyzed.defensiveStrength) || 0,
      offensiveStrength: Number(factorsAnalyzed.offensiveStrength) || 0,
      headToHeadTrend: Number(factorsAnalyzed.headToHeadTrend) || 0,
      recentForm: Math.abs(Number(factorsAnalyzed.formAdvantage) || 0) * 1.2,
      matchupTrend: (Number(factorsAnalyzed.headToHeadTrend) || 0) * 0.8,
    };

    return {
      homeWinProbability: Math.round(homeWin * normalizer * 100) / 100,
      drawProbability: Math.round(draw * normalizer * 100) / 100,
      awayWinProbability: Math.round(awayWin * normalizer * 100) / 100,
      confidenceScore: Math.max(0, Math.min(Number(prediction.confidenceScore) || 0, 100)),
      recommendedBet: prediction.recommendedBet || "no_clear_winner",
      factorsAnalyzed: calculatedFactors,
    };
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  const startedAt = Date.now();
  const requestId = req.headers.get("X-Request-Id") || crypto.randomUUID();
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json", "X-Request-Id": requestId };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method === "GET") {
    return healthResponse("predict-match", requestId, headers);
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", requestId }), { status: 405, headers });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase configuration missing");
    }

    const bearerToken = getBearerToken(req);
    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "Authorization token required", requestId }), { status: 401, headers });
    }

    const authClient = createClient(supabaseUrl, anonKey || serviceRoleKey, {
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized", requestId }), { status: 401, headers });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const limited = await isRateLimitedByUser(supabaseAdmin, authData.user.id);
    if (limited) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait before generating more predictions.", requestId }), { status: 429, headers });
    }

    const matchData: MatchData = await req.json();
    const validationError = validateMatchData(matchData);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError, requestId }), { status: 400, headers });
    }

    const prediction = await analyzeMatchWithGemini(matchData);
    const { data: matchRecord } = await supabaseAdmin
      .from("matches")
      .select("id")
      .eq("match_id", matchData.matchId)
      .single();

    if (matchRecord) {
      await supabaseAdmin.from("match_predictions").insert({
        match_id: matchRecord.id,
        home_win_probability: prediction.homeWinProbability,
        draw_probability: prediction.drawProbability,
        away_win_probability: prediction.awayWinProbability,
        confidence_score: prediction.confidenceScore,
        recommended_bet: prediction.recommendedBet,
        model_version: "gemini-2.5-flash",
        factors_analyzed: prediction.factorsAnalyzed,
      });
    }

    console.log(JSON.stringify({ requestId, event: "predict_match_success", durationMs: Date.now() - startedAt, userId: authData.user.id }));

    return new Response(JSON.stringify({ ...prediction, requestId }), {
      headers,
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error(JSON.stringify({ requestId, event: "predict_match_error", durationMs: Date.now() - startedAt, message }));
    return new Response(JSON.stringify({ error: message, requestId }), {
      status: 500,
      headers,
    });
  }
});