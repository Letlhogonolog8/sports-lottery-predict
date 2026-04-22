-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http" SCHEMA extensions;

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_predictions INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0
);

-- Sports teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  sport TEXT NOT NULL,
  league TEXT NOT NULL,
  logo_url TEXT,
  country TEXT,
  founded_year INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team statistics table
CREATE TABLE IF NOT EXISTS public.team_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  last_5_matches_wins INT DEFAULT 0,
  last_5_matches_draws INT DEFAULT 0,
  last_5_matches_losses INT DEFAULT 0,
  home_wins INT DEFAULT 0,
  home_draws INT DEFAULT 0,
  home_losses INT DEFAULT 0,
  away_wins INT DEFAULT 0,
  away_draws INT DEFAULT 0,
  away_losses INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  current_form_rating DECIMAL(5,2) DEFAULT 0,
  strength_rating DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id TEXT UNIQUE NOT NULL,
  sport TEXT NOT NULL,
  league TEXT NOT NULL,
  home_team_id UUID REFERENCES public.teams(id),
  away_team_id UUID REFERENCES public.teams(id),
  home_team_name TEXT NOT NULL,
  away_team_name TEXT NOT NULL,
  home_score INT,
  away_score INT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'finished')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  minute INT,
  possession_home DECIMAL(5,2),
  possession_away DECIMAL(5,2),
  shots_home INT,
  shots_away INT,
  shots_on_target_home INT,
  shots_on_target_away INT,
  corners_home INT,
  corners_away INT,
  yellow_cards_home INT,
  yellow_cards_away INT,
  red_cards_home INT,
  red_cards_away INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Match predictions table (AI-generated)
CREATE TABLE IF NOT EXISTS public.match_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  home_win_probability DECIMAL(5,2) NOT NULL,
  draw_probability DECIMAL(5,2) NOT NULL,
  away_win_probability DECIMAL(5,2) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  recommended_bet TEXT,
  model_version TEXT,
  factors_analyzed JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User bet slips (predictions users make)
CREATE TABLE IF NOT EXISTS public.bet_slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('home_win', 'draw', 'away_win', 'over_goals', 'under_goals', 'btts')),
  odds DECIMAL(10,2) NOT NULL,
  stake DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void', 'refunded')),
  result TEXT,
  profit_loss DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP WITH TIME ZONE
);

-- User prediction history
CREATE TABLE IF NOT EXISTS public.prediction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  bet_slip_id UUID REFERENCES public.bet_slips(id) ON DELETE SET NULL,
  sport TEXT NOT NULL,
  teams TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence DECIMAL(5,2),
  odds DECIMAL(10,2),
  result TEXT CHECK (result IN ('win', 'loss', 'pending', 'void')),
  profit_loss DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP WITH TIME ZONE
);

-- Live odds table
CREATE TABLE IF NOT EXISTS public.live_odds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  home_win_odds DECIMAL(10,3),
  draw_odds DECIMAL(10,3),
  away_win_odds DECIMAL(10,3),
  over_2_5_goals DECIMAL(10,3),
  under_2_5_goals DECIMAL(10,3),
  btts_yes DECIMAL(10,3),
  btts_no DECIMAL(10,3),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, provider)
);

-- Create indexes for better query performance
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_start_time ON public.matches(start_time);
CREATE INDEX idx_matches_sport_league ON public.matches(sport, league);
CREATE INDEX idx_match_predictions_match_id ON public.match_predictions(match_id);
CREATE INDEX idx_bet_slips_user_id ON public.bet_slips(user_id);
CREATE INDEX idx_bet_slips_match_id ON public.bet_slips(match_id);
CREATE INDEX idx_bet_slips_status ON public.bet_slips(status);
CREATE INDEX idx_prediction_history_user_id ON public.prediction_history(user_id);
CREATE INDEX idx_prediction_history_created_at ON public.prediction_history(created_at);
CREATE INDEX idx_live_odds_match_id ON public.live_odds(match_id);
CREATE INDEX idx_team_stats_team_id ON public.team_stats(team_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_odds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all user profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for teams and team_stats (public read)
CREATE POLICY "Teams are publicly readable"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Team stats are publicly readable"
  ON public.team_stats FOR SELECT
  USING (true);

-- RLS Policies for matches (public read)
CREATE POLICY "Matches are publicly readable"
  ON public.matches FOR SELECT
  USING (true);

-- RLS Policies for match_predictions (public read)
CREATE POLICY "Match predictions are publicly readable"
  ON public.match_predictions FOR SELECT
  USING (true);

-- RLS Policies for live_odds (public read)
CREATE POLICY "Live odds are publicly readable"
  ON public.live_odds FOR SELECT
  USING (true);

-- RLS Policies for bet_slips
CREATE POLICY "Users can view their own bet slips"
  ON public.bet_slips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bet slips"
  ON public.bet_slips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bet slips"
  ON public.bet_slips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for prediction_history
CREATE POLICY "Users can view their own prediction history"
  ON public.prediction_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON public.prediction_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.result IN ('won', 'lost') THEN
    UPDATE public.user_profiles
    SET
      total_predictions = total_predictions + 1,
      wins = wins + CASE WHEN NEW.result = 'won' THEN 1 ELSE 0 END,
      losses = losses + CASE WHEN NEW.result = 'lost' THEN 1 ELSE 0 END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_trigger
AFTER INSERT OR UPDATE ON public.bet_slips
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();
 
-- Lottery draws table
CREATE TABLE IF NOT EXISTS public.lottery_draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  next_draw TIMESTAMP WITH TIME ZONE NOT NULL,
  jackpot TEXT NOT NULL,
  numbers_range_min INT NOT NULL,
  numbers_range_max INT NOT NULL,
  pick_count INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lottery frequency data
CREATE TABLE IF NOT EXISTS public.lottery_frequency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
  number INT NOT NULL,
  frequency INT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(draw_id, number)
);

-- Lottery hot/cold numbers
CREATE TABLE IF NOT EXISTS public.lottery_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
  number INT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('hot', 'cold')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(draw_id, number)
);

-- Create indexes
CREATE INDEX idx_lottery_draws_name ON public.lottery_draws(name);
CREATE INDEX idx_lottery_frequency_draw_id ON public.lottery_frequency(draw_id);
CREATE INDEX idx_lottery_numbers_draw_id ON public.lottery_numbers(draw_id);

-- Enable RLS
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_frequency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_numbers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read)
CREATE POLICY "Lottery draws are publicly readable"
  ON public.lottery_draws FOR SELECT
  USING (true);

CREATE POLICY "Lottery frequency is publicly readable"
  ON public.lottery_frequency FOR SELECT
  USING (true);

CREATE POLICY "Lottery numbers are publicly readable"
  ON public.lottery_numbers FOR SELECT
  USING (true);
 
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  total_settled INT;
  total_wins INT;
  total_losses INT;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  SELECT
    COUNT(*) FILTER (WHERE status IN ('won', 'lost')),
    COUNT(*) FILTER (WHERE status = 'won'),
    COUNT(*) FILTER (WHERE status = 'lost')
  INTO total_settled, total_wins, total_losses
  FROM public.bet_slips
  WHERE user_id = target_user_id;

  UPDATE public.user_profiles
  SET
    total_predictions = COALESCE(total_settled, 0),
    wins = COALESCE(total_wins, 0),
    losses = COALESCE(total_losses, 0),
    accuracy_percentage = CASE
      WHEN COALESCE(total_settled, 0) > 0 THEN ROUND((total_wins::NUMERIC / total_settled::NUMERIC) * 100, 2)
      ELSE 0
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = target_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.bet_slips;

CREATE TRIGGER update_user_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.bet_slips
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();
