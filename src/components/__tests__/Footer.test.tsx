import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  const mockCurrentYear = 2024;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${mockCurrentYear}-01-01`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders footer with correct structure', () => {
    const { container } = render(<Footer />);

    expect(container.querySelector('footer')).toBeInTheDocument();
    expect(container.querySelector('.row')).toHaveClass('row margin-top-large');
    expect(container.querySelector('.paper')).toHaveClass(
      'paper border border-3 border-secondary'
    );
  });

  it('displays app title and description', () => {
    render(<Footer />);

    expect(screen.getByText('World Public Holidays')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Discover public holidays worldwide with comprehensive data/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Built with modern React, TypeScript, and love for open source/
      )
    ).toBeInTheDocument();
  });

  it('displays data source information with correct link', () => {
    render(<Footer />);

    expect(screen.getByText(/Data provided by/)).toBeInTheDocument();

    const openHolidaysLink = screen.getByText('OpenHolidays API');
    expect(openHolidaysLink).toBeInTheDocument();
    expect(openHolidaysLink).toHaveAttribute(
      'href',
      'https://www.openholidaysapi.org'
    );
    expect(openHolidaysLink).toHaveAttribute('target', '_blank');
    expect(openHolidaysLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays connect section with all links', () => {
    render(<Footer />);

    expect(screen.getByText('Connect')).toBeInTheDocument();

    const githubLink = screen.getByText('GitHub');
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/jaamaalxyz/public-holidays-app'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const liveDemoLink = screen.getByText('Live Demo');
    expect(liveDemoLink).toHaveAttribute(
      'href',
      'https://public-holidays-app-nine.vercel.app'
    );
    expect(liveDemoLink).toHaveAttribute('target', '_blank');
    expect(liveDemoLink).toHaveAttribute('rel', 'noopener noreferrer');

    const mediumLink = screen.getByText('Read on Medium');
    expect(mediumLink).toHaveAttribute('href', '#');
    expect(mediumLink).toHaveAttribute('target', '_blank');
    expect(mediumLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays copyright with current year', () => {
    render(<Footer />);

    expect(
      screen.getByText(
        `© ${mockCurrentYear} Md. Jamal Uddin. Released under MIT License.`
      )
    ).toBeInTheDocument();
  });

  it('displays deployment information with Vercel link', () => {
    render(<Footer />);

    expect(screen.getByText(/Deployed on/)).toBeInTheDocument();

    const vercelLink = screen.getByText('Vercel');
    expect(vercelLink).toBeInTheDocument();
    expect(vercelLink).toHaveAttribute('href', 'https://vercel.com');
    expect(vercelLink).toHaveAttribute('target', '_blank');
    expect(vercelLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has proper accessibility attributes for external links', () => {
    render(<Footer />);

    const externalLinks = screen.getAllByRole('link');
    const externalLinksWithBlank = externalLinks.filter(
      link => link.getAttribute('target') === '_blank'
    );

    externalLinksWithBlank.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('updates year dynamically', () => {
    const newYear = 2025;
    vi.setSystemTime(new Date(`${newYear}-06-15`));

    render(<Footer />);

    expect(
      screen.getByText(
        `© ${newYear} Md. Jamal Uddin. Released under MIT License.`
      )
    ).toBeInTheDocument();
  });

  it('has proper CSS classes for layout', () => {
    const { container } = render(<Footer />);

    expect(container.querySelector('.col-md-8')).toBeInTheDocument();
    expect(container.querySelector('.col-12')).toBeInTheDocument();
    expect(container.querySelector('.col-4')).toBeInTheDocument();
    expect(container.querySelector('.col-md-6')).toBeInTheDocument();
    expect(container.querySelector('.text-right')).toBeInTheDocument();
  });
});
