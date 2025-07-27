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
