//frontend/src/pages/auth/StravaCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, AlertCircle } from 'lucide-react';

const StravaCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { stravaLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Strava authentication was cancelled or failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('🔄 Processing Strava OAuth callback...');
        const result = await stravaLogin(code);

        if (result.success) {
          console.log('✅ Strava login successful, redirecting...');
          navigate('/', { replace: true });
        } else {
          setError(result.error || 'Strava login failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('❌ Strava callback error:', err);
        setError(err.response?.data?.message || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, stravaLogin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {error ? (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in with Strava</h2>
            <p className="text-gray-600">Please wait while we complete the authentication...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default StravaCallback;