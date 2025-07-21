import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRealTimeForm } from '@/hooks/use-real-time-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimationProvider } from '@/lib/contexts/animation-context';
import { expect, it, describe } from '@jest/globals';

// Mock the animation context
jest.mock('@/lib/contexts/animation-context', () => ({
  useAnimationContext: () => ({
    preference: 'full',
    duration: 0.3,
    setPreference: jest.fn(),
    setDuration: jest.fn(),
    isAnimationEnabled: () => true,
    getAdjustedDuration: (duration: number) => duration,
    loading: false,
  }),
  AnimationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Test component using the hook
const TestForm = () => {
  const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    showDetails: z.boolean().default(false),
    details: z.string().optional(),
  });

  const form = useRealTimeForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      showDetails: false,
      details: '',
    },
    validationMode: 'onChange',
    validationDelay: 0, // No delay for testing
    progressiveDisclosure: {
      'details': {
        dependsOn: 'showDetails',
        condition: (values) => values.showDetails === true,
      },
    },
  });

  const onSubmit = jest.fn();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...form.register('name')}
          data-testid="name-input"
        />
        {form.formState.errors.name && (
          <span data-testid="name-error">{form.formState.errors.name.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          {...form.register('email')}
          data-testid="email-input"
        />
        {form.formState.errors.email && (
          <span data-testid="email-error">{form.formState.errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="showDetails">Show Details</label>
        <input
          id="showDetails"
          type="checkbox"
          {...form.register('showDetails')}
          data-testid="show-details-checkbox"
        />
      </div>

      {form.isFieldVisible('details') && (
        <div>
          <label htmlFor="details">Details</label>
          <input
            id="details"
            {...form.register('details')}
            data-testid="details-input"
          />
        </div>
      )}

      <button type="submit" data-testid="submit-button">Submit</button>
    </form>
  );
};

describe('useRealTimeForm', () => {
  it('should validate fields in real-time', async () => {
    render(
      <AnimationProvider>
        <TestForm />
      </AnimationProvider>
    );

    // Check initial state
    expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();

    // Type invalid name
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'a' } });
    
    // Wait for validation
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('name-error')).toHaveTextContent('Name must be at least 2 characters');
    });

    // Type valid name
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John' } });
    
    // Wait for validation to clear error
    await waitFor(() => {
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    });

    // Type invalid email
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'not-an-email' } });
    
    // Wait for validation
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email address');
    });

    // Type valid email
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    
    // Wait for validation to clear error
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });

  it('should handle progressive disclosure correctly', async () => {
    render(
      <AnimationProvider>
        <TestForm />
      </AnimationProvider>
    );

    // Details field should not be visible initially
    expect(screen.queryByTestId('details-input')).not.toBeInTheDocument();

    // Check the showDetails checkbox
    fireEvent.click(screen.getByTestId('show-details-checkbox'));

    // Details field should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('details-input')).toBeInTheDocument();
    });

    // Uncheck the showDetails checkbox
    fireEvent.click(screen.getByTestId('show-details-checkbox'));

    // Details field should be hidden again
    await waitFor(() => {
      expect(screen.queryByTestId('details-input')).not.toBeInTheDocument();
    });
  });
});