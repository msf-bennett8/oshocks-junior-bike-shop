//frontend/src/pages/auth/GoogleCallback.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { googleLogin } = useAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('processing'); // processing, success, error
  const hasProcessed = useRef(false); // Prevent multiple calls

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      console.log('⏭️ Callback already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      // Handle OAuth errors
      if (errorParam) {
        console.error('❌ OAuth error:', errorParam);
        setError('Google authentication was cancelled or failed');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Check for authorization code
      if (!code) {
        console.error('❌ No authorization code received');
        setError('No authorization code received from Google');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Mark as processed BEFORE making the API call
      hasProcessed.current = true;

      try {
        console.log('🔄 Processing Google OAuth callback with code:', code.substring(0, 10) + '...');
        setStatus('processing');

        // Make the login request
        const result = await googleLogin(code);

        if (result.success) {
          console.log('✅ Google login successful!');
          setStatus('success');
          
          // Short delay before redirect to show success state
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          console.error('❌ Google login failed:', result.error);
          setError(result.error || 'Google login failed');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('❌ Google callback error:', err);
        setError(err.response?.data?.message || err.message || 'Authentication failed');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array - only run once

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        )}

        {status === 'processing' && (
          <>
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in with Google</h2>
            <p className="text-gray-600">Please wait while we complete the authentication...</p>
            <div className="mt-4">
              <div className="animate-pulse flex space-x-2 justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">You're all set. Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;