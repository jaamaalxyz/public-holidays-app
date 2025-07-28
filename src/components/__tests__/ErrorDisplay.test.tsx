import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  const mockError = new Error('Test error message');

  it('renders with default title and error message', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorDisplay error={mockError} title="Custom Error Title" />);

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorDisplay error={mockError} onRetry={mockRetry} />);

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRetry = vi.fn();

    render(<ErrorDisplay error={mockError} onRetry={mockRetry} />);

    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('displays fallback message when error has no message', () => {
    const errorWithoutMessage = new Error();
    errorWithoutMessage.message = '';

    render(<ErrorDisplay error={errorWithoutMessage} />);

    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ErrorDisplay error={mockError} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('card border-danger');
  });

  it('has proper styling classes', () => {
    const mockRetry = vi.fn();
    render(<ErrorDisplay error={mockError} onRetry={mockRetry} />);

    expect(screen.getByRole('alert')).toHaveClass('card border-danger');
    expect(screen.getByText('Something went wrong')).toHaveClass(
      'card-title text-danger'
    );
    expect(screen.getByText('Test error message')).toHaveClass('card-text');
    expect(screen.getByText('Try Again')).toHaveClass('btn btn-primary');
  });
});
