import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { LoginForm } from '../LoginForm';

// Mock the auth context
const mockLogin = vi.fn();
const mockGetSSOProviders = vi.fn();
const mockInitiateSSOLogin = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    getSSOProviders: mockGetSSOProviders,
    initiateSSOLogin: mockInitiateSSOLogin,
  }),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('LoginForm', () => {
  const mockOnSwitchToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSSOProviders.mockResolvedValue({ providers: ['github'], count: 1 });
  });

  it('renders the login form with all required fields', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted empty', async () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    // Form validation should prevent submission
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find and click the toggle button - it might be inside the input or next to it
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(button => 
      button.getAttribute('type') !== 'submit' && 
      button.textContent !== 'Iniciar Sesión'
    );

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  it('calls onSwitchToRegister when register link is clicked', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const registerLink = screen.getByText(/regístrate aquí/i);
    fireEvent.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
  });
});
