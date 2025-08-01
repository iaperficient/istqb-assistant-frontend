import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { AuthProvider, useAuth } from '../AuthContext';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    getSSOProviders: vi.fn(),
    initiateSSOLogin: vi.fn(),
    authenticateWithSSO: vi.fn(),
  },
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="loading">{isLoading ? 'true' : 'false'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial auth state', async () => {
    // Setup mocks
    (apiService.isAuthenticated as any).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });
});
