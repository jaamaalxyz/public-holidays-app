export const API_BASE_URL = 'https://openholidaysapi.org';

export const CACHE_TIMES = {
  COUNTRIES: 1000 * 60 * 30, // 30 minutes - countries don't change often
  HOLIDAYS: 1000 * 60 * 15, // 15 minutes
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DELAY_MULTIPLIER: 1000,
  MAX_DELAY: 30000,
} as const;
