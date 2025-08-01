import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';

// Mock window.location.href assignments
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.addEventListener and removeEventListener
window.addEventListener = vi.fn();
window.removeEventListener = vi.fn();

// Setup global test environment
beforeAll(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});
