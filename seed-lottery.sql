-- Seed lottery draws
INSERT INTO public.lottery_draws (name, next_draw, jackpot, numbers_range_min, numbers_range_max, pick_count) VALUES
('Powerball', NOW() + INTERVAL '3 days', '$785 Million', 1, 69, 5),
('Mega Millions', NOW() + INTERVAL '2 days', '$425 Million', 1, 70, 5),
('EuroMillions', NOW() + INTERVAL '2 days', '€190 Million', 1, 50, 5),
('UK Lotto', NOW() + INTERVAL '3 days', '£12.5 Million', 1, 59, 6);

-- Seed frequency data (Powerball)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 150 + 50) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 69) as num
WHERE name = 'Powerball';

-- Seed frequency data (Mega Millions)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 140 + 45) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 70) as num
WHERE name = 'Mega Millions';

-- Seed frequency data (EuroMillions)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 160 + 60) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 50) as num
WHERE name = 'EuroMillions';

-- Seed frequency data (UK Lotto)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 130 + 40) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 59) as num
WHERE name = 'UK Lotto';

-- Seed hot numbers (Powerball)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[23, 32, 61, 53, 69, 21]) as num
WHERE name = 'Powerball';

-- Seed cold numbers (Powerball)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[13, 36, 5, 49, 51, 60]) as num
WHERE name = 'Powerball';

-- Seed hot numbers (Mega Millions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[17, 31, 46, 10, 70, 14]) as num
WHERE name = 'Mega Millions';

-- Seed cold numbers (Mega Millions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[8, 45, 52, 67, 3, 29]) as num
WHERE name = 'Mega Millions';

-- Seed hot numbers (EuroMillions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[23, 44, 50, 17, 19, 38]) as num
WHERE name = 'EuroMillions';

-- Seed cold numbers (EuroMillions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[22, 35, 46, 2, 9, 41]) as num
WHERE name = 'EuroMillions';

-- Seed hot numbers (UK Lotto)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[58, 31, 38, 10, 23, 40]) as num
WHERE name = 'UK Lotto';

-- Seed cold numbers (UK Lotto)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[20, 13, 41, 48, 55, 6]) as num
WHERE name = 'UK Lotto';
