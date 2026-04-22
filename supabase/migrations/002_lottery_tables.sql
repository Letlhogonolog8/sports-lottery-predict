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
