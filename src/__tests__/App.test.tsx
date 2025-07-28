import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Mock all the child components
vi.mock('../components/CountrySelector', () => ({
  CountrySelector: vi.fn(
    ({
      selectedCountry,
      onCountryChange,
    }: {
      selectedCountry: string;
      onCountryChange: (value: string) => void;
    }) => (
      <div data-testid="country-selector">
        <select
          value={selectedCountry}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onCountryChange(e.target.value)
          }
          aria-label="Country selector"
        >
          <option value="">Select a country</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>
    )
  ),
}));

vi.mock('../components/HolidayList', () => ({
  HolidayList: vi.fn(({ countryIsoCode }: { countryIsoCode: string }) => (
    <div data-testid="holiday-list">
      {countryIsoCode
        ? `Holidays for ${countryIsoCode}`
        : 'No country selected'}
    </div>
  )),
}));

vi.mock('../components/Footer', () => ({
  Footer: vi.fn(() => <footer data-testid="footer">Footer content</footer>),
}));

vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )),
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

describe('App', () => {
  it('renders main application structure', () => {
    renderWithQueryClient(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('country-selector')).toBeInTheDocument();
    expect(screen.getByTestId('holiday-list')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('displays correct header content', () => {
    renderWithQueryClient(<App />);

    expect(screen.getByText('World Public Holidays')).toBeInTheDocument();
    expect(
      screen.getByText(/Discover public holidays around the world/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Built with modern React, TypeScript, and comprehensive error handling/
      )
    ).toBeInTheDocument();
  });

  it('has proper HTML structure and CSS classes', () => {
    const { container } = renderWithQueryClient(<App />);

    expect(container.querySelector('.paper.container')).toBeInTheDocument();
    expect(container.querySelector('.row')).toBeInTheDocument();
    expect(container.querySelector('.col-12')).toBeInTheDocument();
  });

  it('initializes with empty selected country', () => {
    renderWithQueryClient(<App />);

    expect(screen.getByText('No country selected')).toBeInTheDocument();
    expect(screen.getByLabelText('Country selector')).toHaveValue('');
  });

  it('updates selected country when country selector changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    const countrySelector = screen.getByLabelText('Country selector');
    await user.selectOptions(countrySelector, 'US');

    expect(screen.getByText('Holidays for US')).toBeInTheDocument();
  });

  it('renders with all required components', () => {
    renderWithQueryClient(<App />);

    // Check that all mocked components are rendered
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('country-selector')).toBeInTheDocument();
    expect(screen.getByTestId('holiday-list')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('maintains state correctly across multiple country changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    const countrySelector = screen.getByLabelText('Country selector');

    await user.selectOptions(countrySelector, 'US');
    expect(screen.getByText('Holidays for US')).toBeInTheDocument();

    await user.selectOptions(countrySelector, 'CA');
    expect(screen.getByText('Holidays for CA')).toBeInTheDocument();

    await user.selectOptions(countrySelector, '');
    expect(screen.getByText('No country selected')).toBeInTheDocument();
  });
});
