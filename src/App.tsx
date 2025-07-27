import { useState, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CountrySelector } from './components/CountrySelector';
import { HolidayList } from './components/HolidayList';
import { Footer } from './components/Footer';

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

            <Footer />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
