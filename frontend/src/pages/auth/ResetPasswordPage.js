import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle, X, Shield, AlertTriangle, Check } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white py-12 px-6 shadow-xl rounded-lg text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Validating reset link...
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we verify your password reset request.
          </p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OS</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Oshocks</span>
              </div>
            </Link>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{tokenError}</p>
            </div>

            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OS</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Oshocks</span>
              </div>
            </Link>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {successMessage}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Redirecting to login page in a few seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">OS</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Oshocks</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a strong, unique password for your account
          </p>
        </div>

        {/* User Info */}
        {email && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Resetting password for: <strong>{email}</strong>
            </p>
          </div>
        )}

        {/* General Error */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{validationErrors.general}</p>
          </div>
        )}

        {/* Reset Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                    <span className={`text-xs font-bold ${getStrengthTextColor()}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${Math.min((passwordStrength.score / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="mt-2 text-xs text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Password Requirements Checklist */}
            {formData.password && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-xs text-red-600">{validationErrors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
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
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

// Requirement Item Component
const RequirementItem = ({ met, text }) => {
  return (
    <div className="flex items-center space-x-2">
      {met ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-600'}`}>
        {text}
      </span>
    </div>
  );
};

export default ResetPasswordPage;