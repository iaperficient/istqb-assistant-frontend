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
  getSSOProviders: () => Promise<{ providers: string[], count: number }>;
  initiateSSOLogin: (provider: string) => Promise<void>;
  handleSSOCallback: (provider: string, code: string) => Promise<void>;
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuth = apiService.isAuthenticated();
        if (isAuth) {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              // Verify the user data is still valid by making a request
              const currentUser = await apiService.getCurrentUser();
              setUser(currentUser);
              localStorage.setItem('user_data', JSON.stringify(currentUser));
            } catch (error) {
              // Token is invalid, clear storage
              console.log('Token validation failed, clearing auth data');
              apiService.logout();
              localStorage.removeItem('user_data');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Error during auth check:', error);
        // Continue with unauthenticated state
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    const handleTokenExpired = () => {
      setUser(null);
      localStorage.removeItem('user_data');
      navigate('/auth', { replace: true });
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = async (username, password) => {
    try {
      setIsLoading(true);
      const tokenData = await apiService.login({ username, password });
      
      // Get user data after successful login
      const userData = await apiService.getCurrentUser();
      
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      toast.success(`¡Bienvenido${userData.is_admin ? ' Admin' : ''} al Asistente ISTQB!`);
      
      // Navigate to home page after successful login
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
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

  const logout = () => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('user_data');
    toast.info('Sesión cerrada correctamente');
    navigate('/auth', { replace: true });
  };

  const getSSOProviders = async () => {
    try {
      return await apiService.getSSOProviders();
    } catch (error) {
      toast.error('Error fetching SSO providers');
      throw error;
    }
  };

  const initiateSSOLogin = async (provider) => {
    try {
      const { authorization_url } = await apiService.initiateSSOLogin(provider);
      window.location.href = authorization_url;
    } catch (error) {
      toast.error('Error initiating SSO login');
      throw error;
    }
  };

  const handleSSOCallback = async (provider, code) => {
    try {
      setIsLoading(true);
      const { user } = await apiService.authenticateWithSSO(provider, code);
      setUser(user);
      localStorage.setItem('user_data', JSON.stringify(user));
      toast.success('SSO login successful');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('SSO authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.is_admin || false,
    login,
    register,
    logout,
    getSSOProviders,
    initiateSSOLogin,
    handleSSOCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
