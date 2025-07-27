import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="row margin-top-large">
      <div className="col-12">
        <div className="paper border border-3 border-secondary">
          <div className="row">
            <div className="col-md-8">
              <h6 className="margin-bottom-small">World Public Holidays</h6>
              <p className="text-muted margin-bottom-small">
                Discover public holidays worldwide with comprehensive data from
                over 100 countries. Built with modern React, TypeScript, and
                love for open source.
              </p>
              <p className="text-muted margin-bottom-none">
                Data provided by{' '}
                <a
                  href="https://www.openholidaysapi.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  OpenHolidays API
                </a>{' '}
                - an open data project for public holiday information.
              </p>
            </div>
            <div className="col-12">
              <h6 className="margin-bottom-small">Connect</h6>
              <div className="row margin-bottom-small">
                <div className="col-4">
                  <a
                    href="https://github.com/jaamaalxyz/public-holidays-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    GitHub
                  </a>
                </div>
                <div className="col-4">
                  <a
                    href="https://public-holidays-app-nine.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    Live Demo
                  </a>
                </div>
                <div className="col-4">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    Read on Medium
                  </a>
                </div>
              </div>
            </div>
          </div>
          <hr className="margin-top-small margin-bottom-small" />
          <div className="row">
            <div className="col-md-6">
              <small className="text-muted">
                © {currentYear} Md. Jamal Uddin. Released under MIT
                License.{' '}
              </small>
            </div>
            <div className="col-md-6 text-right">
              <small className="text-muted">
                Deployed on{' '}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  Vercel
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
