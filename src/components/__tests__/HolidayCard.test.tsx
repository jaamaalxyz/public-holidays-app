import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HolidayCard } from '../HolidayCard';
import type { Holiday } from '../../types/api';

vi.mock('../../services/holidaysApi', () => ({
  getLocalizedText: vi.fn((text: unknown) => {
    if (Array.isArray(text)) {
      return (text[0] as { text?: string })?.text || 'Default text';
    }
    return text as string;
  }),
  formatHolidayDate: vi.fn((date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }),
}));

const mockHoliday: Holiday = {
  id: '1',
  name: [{ language: 'en', text: "New Year's Day" }],
  startDate: '2024-01-01',
  endDate: '2024-01-01',
  type: 'Public',
  nationwide: true,
};

const mockRegionalHoliday: Holiday = {
  id: '2',
  name: [{ language: 'en', text: 'Regional Holiday' }],
  startDate: '2024-06-15',
  endDate: '2024-06-16',
  type: 'Regional',
  nationwide: false,
  comment: [{ language: 'en', text: 'This is a regional holiday' }],
};

describe('HolidayCard', () => {
  it('renders holiday name and basic information', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    expect(screen.getByText("New Year's Day")).toBeInTheDocument();
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
  });

  it('renders nationwide badge for nationwide holidays', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    const nationwideBadge = screen.getByText('Nationwide');
    expect(nationwideBadge).toBeInTheDocument();
    expect(nationwideBadge).toHaveClass('badge badge-success');
    expect(nationwideBadge).toHaveAttribute('aria-label', 'Nationwide holiday');
  });

  it('renders regional badge for regional holidays', () => {
    render(<HolidayCard holiday={mockRegionalHoliday} />);

    const regionalBadges = screen.getAllByText('Regional');
    const regionalBadge = regionalBadges.find(badge =>
      badge.classList.contains('badge-warning')
    );
    expect(regionalBadge).toBeInTheDocument();
    expect(regionalBadge).toHaveClass('badge badge-warning');
    expect(regionalBadge).toHaveAttribute('aria-label', 'Regional holiday');
  });

  it('renders holiday type badge', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    const typeBadge = screen.getByText('Public');
    expect(typeBadge).toBeInTheDocument();
    expect(typeBadge).toHaveClass('badge badge-secondary margin-left-small');
    expect(typeBadge).toHaveAttribute('aria-label', 'Holiday type: Public');
  });

  it('renders date range when start and end dates differ', () => {
    render(<HolidayCard holiday={mockRegionalHoliday} />);

    expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/June 16, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/-/)).toBeInTheDocument();
  });

  it('does not render date range when start and end dates are same', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
    expect(screen.queryByText('-')).not.toBeInTheDocument();
  });

  it('renders comment when provided', () => {
    render(<HolidayCard holiday={mockRegionalHoliday} />);

    expect(screen.getByText('This is a regional holiday')).toBeInTheDocument();
  });

  it('does not render comment when not provided', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    expect(screen.queryByText(/This is a/)).not.toBeInTheDocument();
  });

  it('has proper card structure and classes', () => {
    const { container } = render(<HolidayCard holiday={mockHoliday} />);

    expect(container.querySelector('.col-12.col-6-md')).toBeInTheDocument();
    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.card-body')).toBeInTheDocument();
    expect(container.querySelector('.card-title')).toBeInTheDocument();
  });

  it('uses formatting functions from services', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    // Verify that formatting functions are used by checking formatted output
    expect(screen.getByText("New Year's Day")).toBeInTheDocument();
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
  });

  it('renders memoized component correctly', () => {
    render(<HolidayCard holiday={mockHoliday} />);

    // Component should render without issues
    expect(screen.getByText("New Year's Day")).toBeInTheDocument();
  });
});
