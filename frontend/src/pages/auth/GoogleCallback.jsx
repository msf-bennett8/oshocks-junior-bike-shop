//frontend/src/pages/auth/GoogleCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, AlertCircle } from 'lucide-react';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { googleLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google authentication was cancelled or failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('🔄 Processing Google OAuth callback...');
        const result = await googleLogin(code);

        if (result.success) {
          console.log('✅ Google login successful, redirecting...');
          navigate('/', { replace: true });
        } else {
          setError(result.error || 'Google login failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('❌ Google callback error:', err);
        setError(err.response?.data?.message || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, googleLogin, navigate]);

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
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in with Google</h2>
            <p className="text-gray-600">Please wait while we complete the authentication...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;