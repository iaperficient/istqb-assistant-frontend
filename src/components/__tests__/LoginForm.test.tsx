import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual as any,
    useAuth: () => ({
      login: vi.fn().mockResolvedValue({}),
      isLoading: false,
    }),
  };
});

describe('LoginForm', () => {
  const onSwitchToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <AuthProvider>
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
      </AuthProvider>
    );
  });

  it('renders the login form with all required fields', () => {
    // Check form elements are rendered
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/¿no tienes una cuenta?/i)).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted empty', async () => {
    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Check for validation messages
    expect(await screen.findByText(/el nombre de usuario es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/la contraseña es requerida/i)).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;
    
    // Password should be hidden by default
    expect(passwordInput.type).toBe('password');
    
    // Find the toggle button by its position relative to the password input
    const passwordContainer = passwordInput.closest('div');
    const toggleButton = passwordContainer?.querySelector('button');
    
    if (!toggleButton) {
      throw new Error('Toggle button not found');
    }
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('calls onSwitchToRegister when register link is clicked', () => {
    const registerLink = screen.getByText(/regístrate/i);
    fireEvent.click(registerLink);
    expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
  });
});
