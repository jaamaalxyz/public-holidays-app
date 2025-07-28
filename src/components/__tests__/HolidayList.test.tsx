/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HolidayList } from '../HolidayList';
import * as useHolidaysHook from '../../hooks/useHolidays';
import * as useCountriesHook from '../../hooks/useCountries';

const mockHolidays = [
  {
    id: '1',
    name: [{ language: 'en', text: "New Year's Day" }],
    startDate: '2024-01-01',
    endDate: '2024-01-01',
    type: 'Public',
    nationwide: true,
  },
];

const mockCountries = [
  {
    isoCode: 'US',
    name: [{ language: 'en', text: 'United States' }],
    officialLanguages: ['en'],
  },
];

// Mock the hooks
vi.spyOn(useHolidaysHook, 'useHolidays');
vi.spyOn(useCountriesHook, 'useCountries');

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

describe('HolidayList', () => {
  beforeEach(() => {
    vi.mocked(useCountriesHook.useCountries).mockReturnValue({
      data: mockCountries,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  it('returns null when no country code is provided', () => {
    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { container } = renderWithQueryClient(
      <HolidayList countryIsoCode="" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays loading skeleton when data is loading', () => {
    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HolidayList countryIsoCode="US" />);

    expect(
      screen.getByText('Public Holidays in United States (2025)')
    ).toBeInTheDocument();
    // Check for skeleton loading elements
    const skeletons = screen.getAllByRole('generic', { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays holidays when data is loaded', () => {
    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: mockHolidays,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HolidayList countryIsoCode="US" />);

    expect(
      screen.getByText('Public Holidays in United States (2025)')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: /public holidays in united states/i })
    ).toBeInTheDocument();
  });

  it('displays error when holidays fail to load', () => {
    const mockError = new Error('Failed to fetch holidays');
    const mockRefetch = vi.fn();

    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch,
    } as any);

    renderWithQueryClient(<HolidayList countryIsoCode="US" />);

    expect(
      screen.getByText('Failed to load holidays for United States')
    ).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch holidays')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Failed to fetch holidays');
    const mockRefetch = vi.fn();

    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch,
    } as any);

    renderWithQueryClient(<HolidayList countryIsoCode="US" />);

    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('displays no holidays message when holidays array is empty', () => {
    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HolidayList countryIsoCode="US" />);

    expect(
      screen.getByText('No public holidays found for United States in 2025.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /this might be because the country doesn't have recorded holidays/i
      )
    ).toBeInTheDocument();
  });

  it('uses country ISO code when country name is not found', () => {
    vi.mocked(useCountriesHook.useCountries).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useHolidaysHook.useHolidays).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HolidayList countryIsoCode="XY" />);

    expect(
      screen.getByText('Public Holidays in XY (2025)')
    ).toBeInTheDocument();
  });
});
