import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CountrySelector } from '../CountrySelector';

// Mock the API hooks
vi.mock('../../hooks/useCountries', () => ({
  useCountries: () => ({
    data: [
      {
        isoCode: 'US',
        name: [{ language: 'en', text: 'United States' }],
        officialLanguages: ['en'],
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('CountrySelector', () => {
  it('renders country selector with countries', () => {
    const mockOnChange = vi.fn();

    renderWithQueryClient(
      <CountrySelector selectedCountry="" onCountryChange={mockOnChange} />
    );

    expect(screen.getByText('Public Holidays by Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a country:')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('-- Select a Country --')
    ).toBeInTheDocument();
  });
});
