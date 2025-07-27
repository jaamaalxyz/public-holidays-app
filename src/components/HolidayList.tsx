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
