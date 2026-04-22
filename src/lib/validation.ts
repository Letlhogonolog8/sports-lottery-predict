import { z } from 'zod';

// User authentication schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Bet slip schemas
export const betSlipSchema = z.object({
  matchId: z.string().uuid('Invalid match ID'),
  predictionType: z.enum(['home_win', 'draw', 'away_win', 'over_goals', 'under_goals', 'btts'], {
    errorMap: () => ({ message: 'Invalid prediction type' }),
  }),
  odds: z
    .number()
    .positive('Odds must be positive')
    .max(1000, 'Odds cannot exceed 1000')
    .finite('Odds must be a valid number'),
  stake: z
    .number()
    .positive('Stake must be positive')
    .min(1, 'Minimum stake is 1')
    .max(10000, 'Maximum stake is 10000')
    .finite('Stake must be a valid number'),
});

// Match prediction request schema
export const matchPredictionRequestSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required').max(100),
  homeTeam: z.string().min(1, 'Home team is required').max(120),
  awayTeam: z.string().min(1, 'Away team is required').max(120),
  league: z.string().min(1, 'League is required').max(120),
  sport: z.string().min(1, 'Sport is required').max(60),
  homeTeamStats: z
    .object({
      lastFiveWins: z.number().int().min(0).max(5),
      lastFiveDraws: z.number().int().min(0).max(5),
      lastFiveLosses: z.number().int().min(0).max(5),
      homeWins: z.number().int().min(0),
      homeDraws: z.number().int().min(0),
      homeLosses: z.number().int().min(0),
      goalsFor: z.number().int().min(0),
      goalsAgainst: z.number().int().min(0),
      formRating: z.number().min(0).max(100),
    })
    .optional(),
  awayTeamStats: z
    .object({
      lastFiveWins: z.number().int().min(0).max(5),
      lastFiveDraws: z.number().int().min(0).max(5),
      lastFiveLosses: z.number().int().min(0).max(5),
      awayWins: z.number().int().min(0),
      awayDraws: z.number().int().min(0),
      awayLosses: z.number().int().min(0),
      goalsFor: z.number().int().min(0),
      goalsAgainst: z.number().int().min(0),
      formRating: z.number().min(0).max(100),
    })
    .optional(),
});

// User profile update schema
export const userProfileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
});

// Prediction history schema
export const predictionHistorySchema = z.object({
  sport: z.string().min(1).max(60),
  teams: z.string().min(1).max(255),
  prediction: z.string().min(1).max(100),
  confidence: z.number().min(0).max(100),
  odds: z.number().positive().max(1000),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type BetSlipInput = z.infer<typeof betSlipSchema>;
export type MatchPredictionRequest = z.infer<typeof matchPredictionRequestSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type PredictionHistory = z.infer<typeof predictionHistorySchema>;

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function sanitizeNumber(input: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = Number(input);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}
