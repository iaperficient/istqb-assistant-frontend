import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Simple test component
const TestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
    </div>
  );
};

describe('AuthContext', () => {
  // Mock the API module to avoid actual API calls
  vi.mock('../../services/api', () => ({
    __esModule: true,
    default: {
      isAuthenticated: vi.fn().mockResolvedValue(false),
      login: vi.fn(),
      getCurrentUser: vi.fn(),
    },
  }));

  // Mock toast to prevent actual toast notifications
  vi.mock('react-toastify', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

  it('provides initial auth state', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check initial state
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
  });
});
