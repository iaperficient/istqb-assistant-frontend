import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginForm', () => {
  const onSwitchToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderLoginForm = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onSwitchToRegister={onSwitchToRegister} />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders the login form with all required fields', () => {
    renderLoginForm();
    
    // Check form elements are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted empty', async () => {
    renderLoginForm();
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for validation messages
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderLoginForm();
    
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    
    // Password should be hidden by default
    expect(passwordInput.type).toBe('password');
    
    // Find the eye icon button inside the password input container
    const passwordContainer = passwordInput.closest('div');
    const toggleButton = passwordContainer?.querySelector('button');
    
    if (!toggleButton) {
      throw new Error('Password toggle button not found');
    }
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });  

  it('calls onSwitchToRegister when register link is clicked', () => {
    renderLoginForm();
    
    const registerLink = screen.getByText(/register here/i);
    fireEvent.click(registerLink);
    
    expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
  });
});
