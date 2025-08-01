import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const { login, initiateSSOLogin, getSSOProviders, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  const handleSSOLogin = async (provider: string) => {
    try {
      await initiateSSOLogin(provider);
    } catch (error) {
      console.error('SSO Login error:', error);
    }
  };
  
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const { providers } = await getSSOProviders();
        setAvailableProviders(providers);
      } catch (error) {
        console.error('Error loading SSO providers:', error);
      }
    };
    loadProviders();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h2>
          <p className="text-gray-600">Asistente ISTQB para Certificaciones</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={cn(
                  'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                  errors.username && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Ingresa tu usuario"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={cn(
                  'w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                  errors.password && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* SSO Login Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {availableProviders.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleSSOLogin(provider)}
                disabled={isLoading}
                className={cn(
                  'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2'
                )}
              >
                {/* Add an SVG icon for each provider dynamically, here using a generic */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79l1.94.49c-.07.3-.12.61-.12.93 0 3.31 2.69 6 6 6v2zm6.9-2.54c-.26.15-.6.3-.9.46V15c.23-.01.45-.05.67-.1.88-.23 1.68-.6 2.36-1.09-.50-1.8-1.77-3.29-3.39-4.3a2.993 2.993 0 01-.25-4.36 7.98 7.98 0 012.73.44c-.3.28-.58.58-.85.92-.33-.09-.67-.16-1.03-.18v2c.55.07 1.11.22 1.64.45.38 2.24 2.07 4.07 4.22 4.63v-2.08c-.8 0-1-1.08-1-1.75s1.68-3 3.92-3V8c-.58.58-2.58 2.59-2.58 5 0 1.3.42 2 .83 2h-1.25c-.43 0-.84.14-1.29.41.03.11.01.21.01.31 0 .51-.41.93-.92.93H15v4.54c-.5-.24-1.04-.41-1.6-.53.06-.3.1-.51.1-.61-.51.12-1.38.37-2.4.37v-2.03h.25zm3.65-8.36C21.44 9.32 22 10.6 22 12c0 2.1-1.34 3.72-2.93 4.35.33-.69.48-1.46.48-2.26 0-1.1-.3-2.11-.82-2.99.39-.11.75-.3 1.07-.52zm-7.6 2.67c.44.14.88.34 1.31.61-.17-.6-.54-1.14-1.01-1.58a2.012 2.012 0 011.54-.1l.49-.98c-1.1-.51-2.36-.76-3.57-.7.34.65.54 1.36.54 2.11 0 .71-.17 1.37-.5 1.97z" />
                </svg>
                <span>Iniciar sesión con {provider}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary-500 hover:text-primary-600 font-semibold transition-colors duration-200"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
