import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect } from 'vitest';
import { ChatHeader } from '../components/ChatHeader';
import { AuthContext } from '../contexts/AuthContext';

const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  is_admin: true,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
};

const renderWithAuth = (user = mockUser, isAdmin = true) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: true,
          isLoading: false,
          isAdmin,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <ChatHeader />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('ChatHeader', () => {
  it('renders header with English title and subtitle', () => {
    renderWithAuth();
    expect(screen.getByText('ISTQB Assistant')).toBeInTheDocument();
    expect(screen.getByText('Testing Certification Specialist')).toBeInTheDocument();
  });

  it('shows user greeting in English', () => {
    renderWithAuth();
    expect(screen.getByText('Hello, admin!')).toBeInTheDocument();
  });

  it('shows admin badge if user is admin', () => {
    renderWithAuth();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows help text in English', () => {
    renderWithAuth();
    expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
  });
});
