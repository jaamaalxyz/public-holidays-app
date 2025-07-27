import { z } from 'zod';
import {
  CountriesResponseSchema,
  HolidaysResponseSchema,
  ValidationError,
} from '../types/api';
import { API_BASE_URL } from '../constants/api';
import type { Country, Holiday, ApiError } from '../types/api';

class HolidaysApiError extends Error implements ApiError {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'HolidaysApiError';
    this.status = status;
    this.code = code;
  }
}

async function fetchWithValidation<T>(
  url: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new HolidaysApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data: unknown = await response.json();
    const validatedData = schema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid API response format', error);
    }
    if (error instanceof HolidaysApiError) {
      throw error;
    }
    throw new HolidaysApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

export async function fetchCountries(): Promise<Country[]> {
  return fetchWithValidation(
    `${API_BASE_URL}/Countries`,
    CountriesResponseSchema
  );
}

export async function fetchHolidays(
  countryIsoCode: string,
  year?: number
): Promise<Holiday[]> {
  const currentYear = year || new Date().getFullYear();
  const url = `${API_BASE_URL}/PublicHolidays?countryIsoCode=${countryIsoCode}&languageIsoCode=EN&validFrom=${currentYear}-01-01&validTo=${currentYear}-12-31`;

  return fetchWithValidation(url, HolidaysResponseSchema);
}

// Utility functions for data transformation
export function getLocalizedText(
  items: Array<{ language: string; text: string }>,
  preferredLanguage = 'en'
): string {
  const preferred = items.find(
    item => item.language.toLowerCase() === preferredLanguage.toLowerCase()
  );
  return preferred?.text || items[0]?.text || 'Unknown';
}

export function formatHolidayDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
