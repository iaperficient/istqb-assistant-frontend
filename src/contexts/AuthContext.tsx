import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserInfo } from '../types/api';
import apiService from '../services/api';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = apiService.isAuthenticated();
      if (isAuth) {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();

    const handleTokenExpired = () => {
      setUser(null);
      localStorage.removeItem('user_data');
      toast.error('Session expired. Please sign in again.');
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const tokenData = await apiService.login({ username, password });
      
      // Get user data after successful login
      const userData = await apiService.getCurrentUser();
      
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      toast.success(`Welcome${userData.is_admin ? ' Admin' : ''} to the ISTQB Assistant!`);
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const userData = await apiService.register({ username, email, password });
      toast.success('Registro exitoso. Ya puedes iniciar sesión.');
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('user_data');
    toast.info('Sesión cerrada correctamente');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.is_admin || false,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};