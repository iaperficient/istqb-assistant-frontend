import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = apiService.isAuthenticated();
      if (isAuth) {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user_data', JSON.stringify(currentUser));
          } catch (error) {
            console.log('Token validation failed, clearing auth data');
            apiService.logout();
            localStorage.removeItem('user_data');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();

    const handleTokenExpired = () => {
      setUser(null);
      localStorage.removeItem('user_data');
      sessionStorage.clear();
      localStorage.removeItem('conversation_id');
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      navigate('/auth', { replace: true });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('conversation_id');

      const tokenData = await apiService.login({ username, password });
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));

      toast.success(`¡Bienvenido${userData.is_admin ? ' Admin' : ''} al Asistente ISTQB!`);

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
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
      await apiService.register({ username, email, password });
      toast.success('Registro exitoso. Ya puedes iniciar sesión.');
    } catch (error: any) {
      toast.error(error.message || 'Error registering user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    localStorage.removeItem('conversation_id');
    toast.info('Sesión cerrada correctamente');
    navigate('/auth', { replace: true });
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
