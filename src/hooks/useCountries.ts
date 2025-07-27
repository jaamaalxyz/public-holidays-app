import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '../services/holidaysApi';
import { CACHE_TIMES, RETRY_CONFIG } from '../constants/api';
import type { Country } from '../types/api';

export function useCountries() {
  return useQuery<Country[], Error>({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: CACHE_TIMES.COUNTRIES,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.name === 'ValidationError') return false;
      return failureCount < RETRY_CONFIG.MAX_RETRIES;
    },
    retryDelay: attemptIndex =>
      Math.min(
        RETRY_CONFIG.DELAY_MULTIPLIER * 2 ** attemptIndex,
        RETRY_CONFIG.MAX_DELAY
      ),
  });
}
