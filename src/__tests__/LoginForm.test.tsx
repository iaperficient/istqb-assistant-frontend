import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { LoginForm } from '../components/LoginForm';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

describe('LoginForm', () => {
  it('renders login form with all fields', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onSwitchToRegister={() => {}} />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText(/Don\'t have an account/i)).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onSwitchToRegister={() => {}} />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Sign In'));
    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('calls onSwitchToRegister when register button is clicked', () => {
    const mockSwitch = vi.fn();
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onSwitchToRegister={mockSwitch} />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Register here'));
    expect(mockSwitch).toHaveBeenCalled();
  });
});
