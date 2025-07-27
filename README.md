# Building a React Holiday App: A Complete Tutorial

## Overview

In this tutorial, you'll learn how to build a modern React application that fetches and displays public holidays from around the world. This project demonstrates essential concepts including:

- **Data Fetching**: Using React Query for efficient API calls
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Type Safety**: TypeScript with runtime validation using Zod
- **State Management**: React hooks and proper state handling
- **Modern React Patterns**: Functional components, custom hooks, and best practices

## What We'll Build

A responsive web application that allows users to:

- Select a country from a dropdown
- View public holidays for the selected country
- Handle loading states and errors gracefully
- See formatted holiday information with dates and descriptions

## Prerequisites

- Basic knowledge of React, TypeScript, and JavaScript
- Node.js installed on your machine
- Understanding of API concepts

## Step 1: Project Setup

### Initialize the Project

```bash
# Create a new React app with Vite
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
```

### Install Dependencies

```bash
# Core dependencies
npm install @tanstack/react-query papercss zod

# Development dependencies  
npm install -D @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/node vitest jsdom prettier eslint-config-prettier eslint-plugin-prettier
```

**Key Dependencies Explained:**

- `@tanstack/react-query`: Powerful data fetching and caching library
- `papercss`: Lightweight CSS framework for styling
- `zod`: TypeScript-first schema validation library
- Testing libraries: For writing comprehensive tests

## Step 2: Project Structure

Create the following directory structure:

```bash
src/
├── components/
│   ├── CountrySelector.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorDisplay.tsx
│   ├── HolidayCard.tsx
│   ├── HolidayList.tsx
│   └── LoadingSkeleton.tsx
├── constants/
│   └── api.ts
├── hooks/
│   ├── useCountries.ts
│   └── useHolidays.ts
├── services/
│   └── holidaysApi.ts
├── types/
│   └── api.ts
├── App.tsx
├── main.tsx
└── queryClient.ts
```

## Step 3: Configure React Query

**File: `src/queryClient.ts`**

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
```

**File: `src/main.tsx`**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import App from './App';
import 'papercss/dist/paper.min.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

**Key Learning Points:**

- React Query provides caching, background updates, and error handling
- QueryClient configuration sets global defaults for all queries
- Wrapping the app with QueryClientProvider makes React Query available throughout

## Step 4: Define API Constants and Types

**File: `src/constants/api.ts`**

```typescript
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
```

**File: `src/types/api.ts`**

```typescript
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
```

**Key Learning Points:**

- Zod provides runtime type validation, ensuring API responses match expected structure
- TypeScript types are inferred from Zod schemas, maintaining single source of truth
- Custom error classes help distinguish different types of failures

## Step 5: Create API Service Layer

**File: `src/services/holidaysApi.ts`**

```typescript
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
```

**Key Learning Points:**

- Centralized API logic with consistent error handling
- Runtime validation ensures type safety beyond compile time
- Utility functions handle data transformation and localization
- Custom error classes provide detailed error information

## Step 6: Create Custom Hooks

**File: `src/hooks/useCountries.ts`**

```typescript
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
```

**File: `src/hooks/useHolidays.ts`**

```typescript
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
```

**Key Learning Points:**

- Custom hooks encapsulate data fetching logic
- React Query handles caching, refetching, and background updates automatically
- `enabled` option prevents unnecessary API calls
- Intelligent retry logic avoids retrying unrecoverable errors

## Step 7: Error Handling Components

**File: `src/components/ErrorBoundary.tsx`**

```typescript
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card border-danger margin-bottom">
          <div className="card-body">
            <h5 className="card-title text-danger">Something went wrong</h5>
            <p className="card-text">
              An unexpected error occurred. Please refresh the page to try
              again.
            </p>
            {this.state.error && (
              <details className="margin-top">
                <summary>Error details</summary>
                <pre className="text-small">{this.state.error.message}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary margin-top"
              type="button"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**File: `src/components/ErrorDisplay.tsx`**

```typescript
interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  title = 'Something went wrong',
}: ErrorDisplayProps) {
  return (
    <div className="card border-danger" role="alert">
      <div className="card-body">
        <h5 className="card-title text-danger">{title}</h5>
        <p className="card-text">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary" type="button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
```

**Key Learning Points:**

- Error boundaries catch JavaScript errors anywhere in the component tree
- Reusable error display component with retry functionality
- User-friendly error messages with technical details available on demand

## Step 8: Loading State Components

**File: `src/components/LoadingSkeleton.tsx`**

```typescript
interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export function LoadingSkeleton({
  height = '1rem',
  width = '100%',
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div
      className={`loading-skeleton ${className}`}
      style={{
        height,
        width,
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  );
}

export function HolidayListSkeleton() {
  return (
    <div className="row">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="col-12 col-sm-6 col-md-4 margin-bottom">
          <div className="card">
            <div className="card-body">
              <LoadingSkeleton height="1.5rem" className="margin-bottom" />
              <LoadingSkeleton height="1rem" width="60%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Key Learning Points:**

- Loading skeletons provide better user experience than spinners
- Reusable skeleton component with customizable dimensions
- Accessibility considerations with `aria-hidden`

## Step 9: Main Components

**File: `src/components/CountrySelector.tsx`**

```typescript
import type { Country } from '../types/api';
import { getLocalizedText } from '../services/holidaysApi';
import { useCountries } from '../hooks/useCountries';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingSkeleton } from './LoadingSkeleton';

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
}

export function CountrySelector({
  selectedCountry,
  onCountryChange,
}: CountrySelectorProps) {
  const { data: countries, isLoading, error, refetch } = useCountries();

  const getCountryName = (country: Country): string => {
    return getLocalizedText(country.name);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCountryChange(event.target.value);
  };

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Failed to load countries"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="card margin-bottom">
      <div className="card-body">
        <h4 className="card-title">Public Holidays by Country</h4>
        <div className="form-group">
          <label htmlFor="country-select">Choose a country:</label>

          {isLoading ? (
            <LoadingSkeleton height="2.5rem" />
          ) : (
            <select
              id="country-select"
              value={selectedCountry}
              onChange={handleChange}
              className="input-block"
              aria-describedby="country-help"
            >
              <option value="">-- Select a Country --</option>
              {countries?.map(country => (
                <option key={country.isoCode} value={country.isoCode}>
                  {getCountryName(country)} ({country.isoCode})
                </option>
              ))}
            </select>
          )}

          <small id="country-help" className="form-text text-muted">
            Select a country to view its public holidays for the current year.
          </small>
        </div>
      </div>
    </div>
  );
}
```

**File: `src/components/HolidayCard.tsx`**

```typescript
import type { Holiday } from '../types/api';
import { getLocalizedText, formatHolidayDate } from '../services/holidaysApi';

interface HolidayCardProps {
  holiday: Holiday;
}

export function HolidayCard({ holiday }: HolidayCardProps) {
  const name = getLocalizedText(holiday.name);
  const comment = holiday.comment ? getLocalizedText(holiday.comment) : null;
  const formattedDate = formatHolidayDate(holiday.startDate);

  return (
    <div className="col-12 col-sm-6 col-md-4 margin-bottom" role="listitem">
      <div className="card">
        <div className="card-body">
          <h6 className="card-title">{name}</h6>
          <p className="card-text">
            <strong>Date:</strong> {formattedDate}
          </p>
          <p className="card-text">
            <small className="text-muted">
              {holiday.type} • {holiday.nationwide ? 'Nationwide' : 'Regional'}
            </small>
          </p>
          {comment && (
            <p className="card-text">
              <small>{comment}</small>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

**File: `src/components/HolidayList.tsx`**

```typescript
import { useHolidays } from '../hooks/useHolidays';
import { useCountries } from '../hooks/useCountries';
import { getLocalizedText } from '../services/holidaysApi';
import { HolidayCard } from './HolidayCard';
import { ErrorDisplay } from './ErrorDisplay';
import { HolidayListSkeleton } from './LoadingSkeleton';

interface HolidayListProps {
  countryIsoCode: string;
}

export function HolidayList({ countryIsoCode }: HolidayListProps) {
  const { data: countries } = useCountries();
  const {
    data: holidays,
    isLoading,
    error,
    refetch,
  } = useHolidays(countryIsoCode);

  const selectedCountry = countries?.find(c => c.isoCode === countryIsoCode);
  const countryName = selectedCountry
    ? getLocalizedText(selectedCountry.name)
    : countryIsoCode;
  const currentYear = new Date().getFullYear();

  if (!countryIsoCode) {
    return null;
  }

  if (error) {
    return (
      <div className="card margin-bottom">
        <div className="card-body">
          <ErrorDisplay
            error={error}
            title={`Failed to load holidays for ${countryName}`}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card margin-bottom">
      <div className="card-body">
        <h4 className="card-title">
          Public Holidays in {countryName} ({currentYear})
        </h4>

        {isLoading ? (
          <HolidayListSkeleton />
        ) : holidays && holidays.length > 0 ? (
          <div
            className="row"
            role="list"
            aria-label={`Public holidays in ${countryName}`}
          >
            {holidays.map(holiday => (
              <HolidayCard key={holiday.id} holiday={holiday} />
            ))}
          </div>
        ) : (
          <div className="text-center margin-top margin-bottom">
            <p>
              No public holidays found for {countryName} in {currentYear}.
            </p>
            <small className="text-muted">
              This might be because the country doesn't have recorded holidays
              or they're not available in our database.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Step 10: Main App Component

**File: `src/App.tsx`**

```typescript
import { useState, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CountrySelector } from './components/CountrySelector';
import { HolidayList } from './components/HolidayList';

function App() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
  }, []);

  return (
    <ErrorBoundary>
      <div className="paper container">
        <div className="row">
          <div className="col-12">
            <header>
              <h1>World Public Holidays</h1>
              <p>
                Discover public holidays around the world. Built with modern
                React, TypeScript, and comprehensive error handling.
              </p>
            </header>

            <main>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
              />

              <HolidayList countryIsoCode={selectedCountry} />
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

## Step 11: Styling

**File: `src/index.css`**

```css
/* Add pulse animation for loading skeletons */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.loading-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Improve responsiveness */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Card improvements */
.card {
  transition: box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Error states */
.border-danger {
  border-color: #dc3545 !important;
}

.text-danger {
  color: #dc3545 !important;
}
```

## Step 12: Testing (Optional)

**File: `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**File: `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

## Step 13: Run the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Key Concepts Learned

### 1. **Data Fetching with React Query**

- Automatic caching and background refetching
- Loading and error states handled declaratively
- Intelligent retry logic and stale-time configuration

### 2. **Error Handling**

- Multiple layers: API errors, validation errors, and React error boundaries
- User-friendly error messages with retry functionality
- Graceful degradation when APIs fail

### 3. **Type Safety**

- TypeScript for compile-time type checking
- Zod for runtime validation of API responses
- Type inference to maintain single source of truth

### 4. **Modern React Patterns**

- Functional components with hooks
- Custom hooks for reusable logic
- Component composition and separation of concerns

### 5. **User Experience**

- Loading skeletons for better perceived performance
- Responsive design with CSS Grid/Flex box
- Accessibility considerations (ARIA labels, semantic HTML)

## Next Steps

To extend this application, consider:

1. **Add more features**: Search functionality, holiday filtering, calendar view
2. **Improve performance**: Virtual scrolling for large lists, image optimization
3. **Add testing**: Unit tests, integration tests, e2e tests
4. **Internationalization**: Multiple language support
5. **Offline support**: Service workers and cache strategies
6. **Analytics**: User interaction tracking

## Conclusion

This tutorial demonstrates building a production-ready React application with modern best practices. The key takeaways are:

- **Separation of concerns**: API logic, UI components, and business logic are well-separated
- **Error resilience**: Multiple error handling strategies ensure good user experience
- **Type safety**: TypeScript and runtime validation prevent bugs
- **Performance**: React Query handles caching and optimization automatically
- **Maintainability**: Clear structure and patterns make the code easy to understand and extend

The patterns shown here scale well to larger applications and provide a solid foundation for any React project.

Happy coding!
