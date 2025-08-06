import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatHeader } from '../components/ChatHeader';
import { AuthContext } from '../contexts/AuthContext';

const mockUser = { username: 'admin', is_admin: true };

const renderWithAuth = (user = mockUser, isAdmin = true) => {
  return render(
    <AuthContext.Provider value={{ user, logout: jest.fn(), isAdmin }}>
      <ChatHeader />
    </AuthContext.Provider>
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
