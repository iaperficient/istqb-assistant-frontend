import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export const SSOCallback: React.FC = () => {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSSOCallback } = useAuth();
  const processingRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple simultaneous authentication attempts
      if (processingRef.current) {
        return;
      }
      processingRef.current = true;
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('SSO Error:', error, errorDescription);
        toast.error(`SSO Authentication failed: ${errorDescription || error}`);
        navigate('/auth', { replace: true });
        return;
      }

      if (!provider) {
        toast.error('Missing SSO provider in callback');
        navigate('/auth', { replace: true });
        return;
      }

      if (!code) {
        toast.error('Missing authorization code from SSO provider');
        navigate('/auth', { replace: true });
        return;
      }

      try {
        await handleSSOCallback(provider, code);
        // handleSSOCallback should navigate to home on success
      } catch (error) {
        console.error('SSO callback processing failed:', error);
        navigate('/auth', { replace: true });
      } finally {
        processingRef.current = false;
      }
    };

    processCallback();
  }, [provider, searchParams, navigate, handleSSOCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Procesando autenticación...
        </h2>
        <p className="text-gray-600">
          Validando tus credenciales con {provider}
        </p>
      </div>
    </div>
  );
};
