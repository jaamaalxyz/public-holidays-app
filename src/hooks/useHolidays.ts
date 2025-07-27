import { useQuery } from '@tanstack/react-query';
import { fetchHolidays } from '../services/holidaysApi';
import { CACHE_TIMES, RETRY_CONFIG } from '../constants/api';
import type { Holiday } from '../types/api';

export function useHolidays(countryIsoCode: string, year?: number) {
  return useQuery<Holiday[], Error>({
    queryKey: ['holidays', countryIsoCode, year],
    queryFn: () => fetchHolidays(countryIsoCode, year),
    enabled: !!countryIsoCode,
    staleTime: CACHE_TIMES.HOLIDAYS,
    retry: (failureCount, error) => {
      // Don't retry on validation errors or 404s
      if (error.name === 'ValidationError') return false;
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex =>
      Math.min(RETRY_CONFIG.DELAY_MULTIPLIER * 2 ** attemptIndex, 10000),
  });
}
