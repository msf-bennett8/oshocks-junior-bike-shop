//src/frontend/src/pages/auth/ResetPasswordPae.js
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeviceFingerprint } from '../../hooks/useDeviceFingerprint';
import { Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle, X, Shield, AlertTriangle, Check } from 'lucide-react';
import Logo from '../../components/common/Logo';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    label: '',
    color: ''
  });
  
  // Device fingerprint for audit logging
  const { fingerprint } = useDeviceFingerprint();

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    notCommon: true,
    notPreviouslyUsed: true
  });

  // Common passwords list (subset for demonstration)
  const commonPasswords = [
    'password', '12345678', 'password123', 'qwerty', 'abc123', 
    'password1', '12345', 'letmein', 'welcome', 'monkey',
    'admin123', 'test123', 'user123', 'demo123'
  ];

  // Validate token on component mount
  useEffect(() => {
    validateResetToken();
  }, [token, email]);

  // Validate reset token
  const validateResetToken = async () => {
    if (!token || !email) {
      setTokenError('Invalid or missing reset link. Please request a new password reset.');
      setTokenValid(false);
      setIsValidatingToken(false);
      return;
    }

    try {
      // API call to validate token
      // Example: await axios.post('/api/password/validate-token', { token, email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response - replace with actual API call
      const response = {
        valid: true,
        password_history: [] // Will contain hashed previous passwords
      };

      if (response.valid) {
        setTokenValid(true);
        setPasswordHistory(response.password_history || []);
      } else {
        setTokenError('This password reset link has expired or is invalid.');
        setTokenValid(false);
      }
    } catch (err) {
      console.error('Token validation error:', err);
      if (err.response?.status === 404) {
        setTokenError('Invalid reset token. Please request a new password reset.');
      } else if (err.response?.status === 410) {
        setTokenError('This reset link has expired. Password reset links are valid for 1 hour.');
      } else {
        setTokenError('Unable to validate reset link. Please try again.');
      }
      setTokenValid(false);
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Calculate password strength and check requirements
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({ score: 0, feedback: [], label: '', color: '' });
      setPasswordRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        notCommon: true,
        notPreviouslyUsed: true
      });
      return;
    }

    const password = formData.password;
    let score = 0;
    const feedback = [];
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notCommon: !commonPasswords.includes(password.toLowerCase()),
      notPreviouslyUsed: true // Will be checked on submission
    };

    setPasswordRequirements(requirements);

    // Calculate score
    if (requirements.minLength) score += 1;
    if (requirements.hasUpperCase && requirements.hasLowerCase) score += 1;
    if (requirements.hasNumber) score += 1;
    if (requirements.hasSpecialChar) score += 1;
    if (password.length >= 12) score += 1;
    if (!requirements.notCommon) score -= 2;

    // Generate feedback
    if (!requirements.minLength) feedback.push('Use at least 8 characters');
    if (!requirements.hasUpperCase) feedback.push('Include uppercase letters');
    if (!requirements.hasLowerCase) feedback.push('Include lowercase letters');
    if (!requirements.hasNumber) feedback.push('Include numbers');
    if (!requirements.hasSpecialChar) feedback.push('Include special characters');
    if (!requirements.notCommon) feedback.push('This is a commonly used password');

    // Determine label and color
    let label = '';
    let color = '';

    if (score <= 1) {
      label = 'Very Weak';
      color = 'red';
    } else if (score === 2) {
      label = 'Weak';
      color = 'orange';
    } else if (score === 3) {
      label = 'Fair';
      color = 'yellow';
    } else if (score === 4) {
      label = 'Good';
      color = 'lime';
    } else {
      label = 'Strong';
      color = 'green';
    }

    setPasswordStrength({ score: Math.max(0, score), feedback, label, color });
  }, [formData.password]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Check if password was previously used
  const checkPasswordHistory = async (password) => {
    if (passwordHistory.length === 0) return true;

    setIsCheckingHistory(true);

    try {
      // API call to check password history
      // The backend should hash the password and compare with stored hashes
      // Example: await axios.post('/api/password/check-history', { password, token });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock response - replace with actual API call
      const response = {
        is_unique: true // true if password not in history
      };

      return response.is_unique;
    } catch (err) {
      console.error('Password history check error:', err);
      return true; // Allow in case of error
    } finally {
      setIsCheckingHistory(false);
    }
  };

  // Validate form
  const validateForm = async () => {
    const errors = {};

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!passwordRequirements.hasUpperCase || !passwordRequirements.hasLowerCase) {
      errors.password = 'Password must contain both uppercase and lowercase letters';
    } else if (!passwordRequirements.hasNumber) {
      errors.password = 'Password must contain at least one number';
    } else if (!passwordRequirements.hasSpecialChar) {
      errors.password = 'Password must contain at least one special character';
    } else if (!passwordRequirements.notCommon) {
      errors.password = 'This password is too common. Please choose a stronger password';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Check password history
    if (!errors.password) {
      const isUnique = await checkPasswordHistory(formData.password);
      if (!isUnique) {
        errors.password = 'You cannot reuse a previous password. Please choose a different password';
        setPasswordRequirements(prev => ({ ...prev, notPreviouslyUsed: false }));
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // API call to reset password
      // Example: await axios.post('/api/password/reset', { token, email, password: formData.password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful response
      const response = {
        success: true,
        message: 'Your password has been reset successfully!'
      };

      if (response.success) {
        setSuccessMessage(response.message);
        
        // Log password reset completed event
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
          await logFrontendAuditEvent(AUDIT_EVENTS.PASSWORD_RESET_COMPLETED, {
            category: 'auth',
            severity: 'medium',
            metadata: {
              reset_method: 'token',
              device_fingerprint: fingerprint,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (e) {
          // Silently fail
        }
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Password reset successful! You can now sign in with your new password.'
            }
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
      } else if (err.response?.status === 410) {
        setTokenError('This reset link has expired. Please request a new password reset.');
        setTokenValid(false);
      } else {
        setValidationErrors({
          general: err.response?.data?.message || 'Failed to reset password. Please try again.'
        });
        
        // Log password reset failed event
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
          await logFrontendAuditEvent(AUDIT_EVENTS.PASSWORD_RESET_FAILED, {
            category: 'auth',
            severity: 'high',
            metadata: {
              failure_reason: err.response?.data?.message || 'reset_failed',
              device_fingerprint: fingerprint,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (e) {
          // Silently fail
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get password strength color
  const getStrengthColor = () => {
    switch (passwordStrength.color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'lime': return 'bg-lime-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthTextColor = () => {
    switch (passwordStrength.color) {
      case 'red': return 'text-red-700';
      case 'orange': return 'text-orange-700';
      case 'yellow': return 'text-yellow-700';
      case 'lime': return 'text-lime-700';
      case 'green': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20" style={{ background: 'radial-gradient(circle at 70% 30%, rgb(255, 69, 0) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15" style={{ background: 'radial-gradient(circle at 30% 70%, rgb(220, 50, 0) 0%, transparent 50%)' }} />
        </div>
        
        {/* LEFT COLUMN */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-900 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10">
            <Logo size="large" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-light text-white mb-4 leading-relaxed">
              Experience cycling gear<br />
              with seamless, scalable speed<br />
              with Oshocks Cloud.
            </h2>
          </div>
          <div className="relative z-10 mt-auto">
            <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
              <defs>
                <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#2d3748', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#1a202c', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ff4500', stopOpacity:0.8}} />
                  <stop offset="100%" style={{stopColor:'#ff8c00', stopOpacity:0.8}} />
                </linearGradient>
              </defs>
              <rect x="50" y="100" width="60" height="200" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="120" y="150" width="80" height="150" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="210" y="80" width="70" height="220" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="290" y="120" width="60" height="180" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="60" y="120" width="15" height="15" fill="#ff8c00" opacity="0.6"/>
              <rect x="85" y="120" width="15" height="15" fill="#ff8c00" opacity="0.8"/>
              <rect x="60" y="145" width="15" height="15" fill="#ff4500" opacity="0.5"/>
              <rect x="85" y="145" width="15" height="15" fill="#ff8c00" opacity="0.7"/>
              <rect x="135" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.6"/>
              <rect x="165" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.8"/>
              <path d="M80 100 L130 80" stroke="#ff8c00" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
              <path d="M200 150 L250 120" stroke="#ff4500" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
              <ellipse cx="200" cy="300" rx="180" ry="20" fill="#1a202c" opacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
          <div className="max-w-md w-full py-12 px-6 rounded-lg border border-gray-800 text-center" style={{ backgroundColor: '#111318' }}>
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Validating reset link...
            </h3>
            <p className="text-sm text-gray-400">
              Please wait while we verify your password reset request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20" style={{ background: 'radial-gradient(circle at 70% 30%, rgb(255, 69, 0) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15" style={{ background: 'radial-gradient(circle at 30% 70%, rgb(220, 50, 0) 0%, transparent 50%)' }} />
        </div>
        
        {/* LEFT COLUMN */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-900 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10">
            <Logo size="large" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-light text-white mb-4 leading-relaxed">
              Experience cycling gear<br />
              with seamless, scalable speed<br />
              with Oshocks Cloud.
            </h2>
          </div>
          <div className="relative z-10 mt-auto">
            <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
              <defs>
                <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#2d3748', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#1a202c', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ff4500', stopOpacity:0.8}} />
                  <stop offset="100%" style={{stopColor:'#ff8c00', stopOpacity:0.8}} />
                </linearGradient>
              </defs>
              <rect x="50" y="100" width="60" height="200" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="120" y="150" width="80" height="150" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="210" y="80" width="70" height="220" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="290" y="120" width="60" height="180" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="60" y="120" width="15" height="15" fill="#ff8c00" opacity="0.6"/>
              <rect x="85" y="120" width="15" height="15" fill="#ff8c00" opacity="0.8"/>
              <rect x="60" y="145" width="15" height="15" fill="#ff4500" opacity="0.5"/>
              <rect x="85" y="145" width="15" height="15" fill="#ff8c00" opacity="0.7"/>
              <rect x="135" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.6"/>
              <rect x="165" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.8"/>
              <path d="M80 100 L130 80" stroke="#ff8c00" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
              <path d="M200 150 L250 120" stroke="#ff4500" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
              <ellipse cx="200" cy="300" rx="180" ry="20" fill="#1a202c" opacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center lg:hidden">
              <Link to="/" className="inline-block">
                <Logo size="large" />
              </Link>
            </div>

            <div className="py-8 px-6 rounded-lg border border-gray-800" style={{ backgroundColor: '#111318' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Invalid Reset Link
                </h2>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-300">{tokenError}</p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-600/20 text-sm font-semibold text-white bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-500 hover:to-orange-600 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 ease-out"
                >
                  Request New Reset Link
                </Link>
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:border-orange-600/50 hover:text-white active:scale-[0.98] transition-all duration-200"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (successMessage) {
    return (
      <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20" style={{ background: 'radial-gradient(circle at 70% 30%, rgb(255, 69, 0) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15" style={{ background: 'radial-gradient(circle at 30% 70%, rgb(220, 50, 0) 0%, transparent 50%)' }} />
        </div>
        
        {/* LEFT COLUMN */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-900 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10">
            <Logo size="large" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-light text-white mb-4 leading-relaxed">
              Experience cycling gear<br />
              with seamless, scalable speed<br />
              with Oshocks Cloud.
            </h2>
          </div>
          <div className="relative z-10 mt-auto">
            <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
              <defs>
                <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#2d3748', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#1a202c', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ff4500', stopOpacity:0.8}} />
                  <stop offset="100%" style={{stopColor:'#ff8c00', stopOpacity:0.8}} />
                </linearGradient>
              </defs>
              <rect x="50" y="100" width="60" height="200" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="120" y="150" width="80" height="150" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="210" y="80" width="70" height="220" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="290" y="120" width="60" height="180" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
              <rect x="60" y="120" width="15" height="15" fill="#ff8c00" opacity="0.6"/>
              <rect x="85" y="120" width="15" height="15" fill="#ff8c00" opacity="0.8"/>
              <rect x="60" y="145" width="15" height="15" fill="#ff4500" opacity="0.5"/>
              <rect x="85" y="145" width="15" height="15" fill="#ff8c00" opacity="0.7"/>
              <rect x="135" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.6"/>
              <rect x="165" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.8"/>
              <path d="M80 100 L130 80" stroke="#ff8c00" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
              <path d="M200 150 L250 120" stroke="#ff4500" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
              <ellipse cx="200" cy="300" rx="180" ry="20" fill="#1a202c" opacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center lg:hidden">
              <Link to="/" className="inline-block">
                <Logo size="large" />
              </Link>
            </div>

            <div className="py-8 px-6 rounded-lg border border-gray-800" style={{ backgroundColor: '#111318' }}>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce border border-green-500/20">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Password Reset Successful!
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  {successMessage}
                </p>
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-sm text-orange-300">
                    Redirecting to login page in a few seconds...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      {/* Ambient background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20" style={{ background: 'radial-gradient(circle at 70% 30%, rgb(255, 69, 0) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15" style={{ background: 'radial-gradient(circle at 30% 70%, rgb(220, 50, 0) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>

      {/* LEFT COLUMN - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-900 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10">
          <Logo size="large" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-light text-white mb-4 leading-relaxed">
            Experience cycling gear<br />
            with seamless, scalable speed<br />
            with Oshocks Cloud.
          </h2>
          <div className="flex items-center gap-6 mt-8 opacity-70">
            <div className="text-white flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.032.063.056.127.088.19l.256.415c.16.256.336.48.512.672.192.208.416.368.672.48.256.112.528.16.832.16.288 0 .544-.048.768-.16.224-.112.416-.272.576-.48.16-.208.304-.448.432-.72.128-.272.224-.576.288-.912.064-.336.096-.688.096-1.056 0-.368-.032-.72-.096-1.056a3.87 3.87 0 0 0-.288-.912 2.5 2.5 0 0 0-.576-.72c-.224-.192-.48-.288-.768-.288a1.8 1.8 0 0 0-.832.176 2.29 2.29 0 0 0-.672.496 3.46 3.46 0 0 0-.512.688l-.256.416a2.6 2.6 0 0 0-.088.192c-.112.208-.192.4-.256.576-.048.176-.08.416-.08.72zM12.02 14.4c.544 0 1.024-.112 1.44-.336.416-.224.768-.528 1.056-.896.288-.368.512-.8.656-1.28.144-.48.224-.992.224-1.52 0-.544-.08-1.056-.224-1.536a3.81 3.81 0 0 0-.656-1.28c-.288-.368-.64-.672-1.056-.896-.416-.224-.896-.336-1.44-.336-.544 0-1.024.112-1.44.336-.416.224-.768.528-1.056.896-.288.368-.512.8-.656 1.28-.144.48-.224.992-.224 1.536 0 .528.08 1.04.224 1.52.144.48.368.912.656 1.28.288.368.64.672 1.056.896.416.224.896.336 1.44.336z"/>
              </svg>
              <span className="text-sm">ann</span>
            </div>
            <div className="text-white flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03-.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-9.029-6.833zm3.836 14.169h-1.57a.477.477 0 0 0-.477.476v5.305h-5.774v-5.305a.477.477 0 0 0-.477-.476h-1.57a.477.477 0 0 0-.477.476v5.956a.476.476 0 0 0 .477.476h7.788a.477.477 0 0 0 .476-.476v-5.956a.476.476 0 0 0-.476-.476zm6.33-8.48v-.49h-1.61v.49h.945v5.426h-.945v.49h1.61v-.49h-.945V8.069h.945z"/>
              </svg>
              <span className="text-sm">isotope execution</span>
            </div>
            <div className="text-white flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 5.65h9.94v9.95H0V5.65zM14.06 5.65H24v9.95H14.06V5.65zM0 19.17h9.94V24H0v-4.83zM14.06 19.17H24V24H14.06v-4.83z"/>
              </svg>
              <span className="text-sm">accella silicon</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-auto">
          <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
            <defs>
              <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#2d3748', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#1a202c', stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#ff4500', stopOpacity:0.8}} />
                <stop offset="100%" style={{stopColor:'#ff8c00', stopOpacity:0.8}} />
              </linearGradient>
            </defs>
            <rect x="50" y="100" width="60" height="200" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="120" y="150" width="80" height="150" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="210" y="80" width="70" height="220" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="290" y="120" width="60" height="180" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="60" y="120" width="15" height="15" fill="#ff8c00" opacity="0.6"/>
            <rect x="85" y="120" width="15" height="15" fill="#ff8c00" opacity="0.8"/>
            <rect x="60" y="145" width="15" height="15" fill="#ff4500" opacity="0.5"/>
            <rect x="85" y="145" width="15" height="15" fill="#ff8c00" opacity="0.7"/>
            <rect x="135" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.6"/>
            <rect x="165" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.8"/>
            <path d="M80 100 L130 80" stroke="#ff8c00" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
            <path d="M200 150 L250 120" stroke="#ff4500" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
            <ellipse cx="200" cy="300" rx="180" ry="20" fill="#1a202c" opacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* RIGHT COLUMN - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10" style={{ backgroundColor: 'transparent' }}>
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <Link to="/" className="inline-block lg:hidden">
              <Logo size="large" />
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Create a strong, unique password for your account
            </p>
          </div>

        {/* User Info */}
        {email && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
            <p className="text-sm text-orange-300">
              Resetting password for: <strong>{email}</strong>
            </p>
          </div>
        )}

        {/* General Error */}
        {validationErrors.general && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{validationErrors.general}</p>
          </div>
        )}

        {/* Reset Form */}
        <div className="py-8 px-6 rounded-lg border border-gray-800" style={{ backgroundColor: '#111318' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 transition-colors text-white placeholder-gray-500`}
                  style={{ backgroundColor: '#1a1f26' }}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Password Strength:</span>
                    <span className={`text-xs font-bold ${getStrengthTextColor()}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${Math.min((passwordStrength.score / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="mt-2 text-xs text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {/* Password Requirements Checklist */}
            {formData.password && (
              <div className="rounded-lg p-4 space-y-2 border border-gray-700" style={{ backgroundColor: '#1a1f26' }}>
                <p className="text-xs font-semibold text-gray-300 mb-2">Password Requirements:</p>
                <div className="space-y-1.5">
                  <RequirementItem 
                    met={passwordRequirements.minLength} 
                    text="At least 8 characters" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasUpperCase && passwordRequirements.hasLowerCase} 
                    text="Uppercase and lowercase letters" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasNumber} 
                    text="At least one number" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasSpecialChar} 
                    text="At least one special character (!@#$%^&*)" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.notCommon} 
                    text="Not a commonly used password" 
                  />
                  {isCheckingHistory ? (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Loader className="w-3 h-3 animate-spin" />
                      <span>Checking password history...</span>
                    </div>
                  ) : (
                    <RequirementItem 
                      met={passwordRequirements.notPreviouslyUsed} 
                      text="Not previously used" 
                    />
                  )}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 transition-colors text-white placeholder-gray-500`}
                  style={{ backgroundColor: '#1a1f26' }}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-xs text-red-400">{validationErrors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 flex items-start space-x-3">
              <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-orange-300">
                <p className="font-semibold mb-1">Security Tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Never share your password with anyone</li>
                  <li>Use a unique password for each account</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isCheckingHistory}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-600/20 text-sm font-semibold text-white bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-500 hover:to-orange-600 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 ease-out"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-400">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-orange-500 hover:text-orange-400 hover:underline underline-offset-2 transition-all duration-200"
          >
            Back to Login
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

// Requirement Item Component
const RequirementItem = ({ met, text }) => {
  return (
    <div className="flex items-center space-x-2">
      {met ? (
        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-500 flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-green-400' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
};

export default ResetPasswordPage;