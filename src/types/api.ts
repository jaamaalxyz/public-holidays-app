import { z } from 'zod';

// Zod schemas for runtime validation
export const LocalizedTextSchema = z.object({
  language: z.string(),
  text: z.string(),
});

export const CountrySchema = z.object({
  isoCode: z.string(),
  name: z.array(LocalizedTextSchema),
  officialLanguages: z.array(z.string()),
});

export const HolidaySchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.string(),
  nationwide: z.boolean(),
  name: z.array(LocalizedTextSchema),
  comment: z.array(LocalizedTextSchema).optional(),
});

// Inferred TypeScript types
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;
export type Country = z.infer<typeof CountrySchema>;
export type Holiday = z.infer<typeof HolidaySchema>;

// API response schemas
export const CountriesResponseSchema = z.array(CountrySchema);
export const HolidaysResponseSchema = z.array(HolidaySchema);

// API error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ValidationError extends Error {
  public cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.cause = cause;
  }
}
