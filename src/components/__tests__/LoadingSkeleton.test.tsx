import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LoadingSkeleton,
  HolidayCardSkeleton,
  HolidayListSkeleton,
} from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('loading-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.style.height).toBe('1rem');
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.backgroundColor).toBe('rgb(226, 232, 240)');
  });

  it('renders with custom props', () => {
    const { container } = render(
      <LoadingSkeleton className="custom-class" height="2rem" width="50%" />
    );
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('loading-skeleton custom-class');
    expect(skeleton.style.height).toBe('2rem');
    expect(skeleton.style.width).toBe('50%');
  });

  it('has pulse animation style', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton.style.animation).toBe(
      'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    );
  });
});

describe('HolidayCardSkeleton', () => {
  it('renders card structure with multiple skeletons', () => {
    const { container } = render(<HolidayCardSkeleton />);

    expect(container.querySelector('.col-12.col-6-md')).toBeInTheDocument();

    const skeletons = screen.getAllByRole('generic', { hidden: true });
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('has proper card layout classes', () => {
    const { container } = render(<HolidayCardSkeleton />);

    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.card-body')).toBeInTheDocument();
    expect(container.querySelector('.margin-bottom-small')).toBeInTheDocument();
  });
});

describe('HolidayListSkeleton', () => {
  it('renders 6 holiday card skeletons', () => {
    render(<HolidayListSkeleton />);

    const cards = screen
      .getAllByRole('generic')
      .filter(el => el.classList.contains('col-12'));
    expect(cards).toHaveLength(6);
  });

  it('has row layout class', () => {
    const { container } = render(<HolidayListSkeleton />);

    expect(container.firstChild).toHaveClass('row');
  });

  it('renders correct total number of skeleton elements', () => {
    render(<HolidayListSkeleton />);

    const allSkeletons = screen.getAllByRole('generic', { hidden: true });
    expect(allSkeletons.length).toBeGreaterThanOrEqual(24); // At least 6 cards × 4 skeletons each
  });
});
