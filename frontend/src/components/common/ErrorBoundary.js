import React from 'react';
import { useAudit } from '../../hooks/useAudit';
import { logFrontendAuditEvent } from '../../utils/auditUtils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null,
      isRecovering: false,
      errorHistory: []
    };
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  async componentDidCatch(error, errorInfo) {
    const now = Date.now();
    const errorCount = this.state.errorCount + 1;
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorType: error.name,
      errorCount
    };

    console.error('🚨 Error Boundary Caught:', errorDetails);

    // Store error in history
    const errorHistory = [
      ...this.state.errorHistory.slice(-4), // Keep last 4 errors
      {
        ...errorDetails,
        shortMessage: this.getShortErrorMessage(error)
      }
    ];

    this.setState({
      error,
      errorInfo,
      errorCount,
      lastErrorTime: now,
      errorHistory
    });

    // Send error to audit logging service
    await this.logErrorToAuditService(errorDetails);

    // Check for error loop
    if (this.state.lastErrorTime && now - this.state.lastErrorTime < 1000) {
      console.error('⚠️ Rapid error loop detected!');
    }

    // Prevent infinite error loops
    if (errorCount > 5) {
      console.error('⛔ Too many errors. Stopping recovery attempts.');
      this.recoveryAttempts = this.maxRecoveryAttempts;
    }
  }

  getShortErrorMessage = (error) => {
    const message = error.message || error.toString();
    // Extract meaningful error type
    if (message.includes('ChunkLoadError')) return 'Failed to load application chunk';
    if (message.includes('NetworkError')) return 'Network connection error';
    if (message.includes('TypeError')) return 'Type error in component';
    if (message.includes('ReferenceError')) return 'Reference error';
    if (message.includes('SyntaxError')) return 'Syntax error';
    return message.slice(0, 100);
  };

  getErrorCategory = (error) => {
    const message = error?.message || '';
    if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
      return 'chunk';
    }
    if (message.includes('Network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('ResizeObserver')) {
      return 'resize-observer';
    }
    return 'general';
  };

  /*  
  //This replaced by the  function below
  logErrorToService = async (errorDetails) => {
    // This would integrate with your error logging service
    // Example: Sentry, LogRocket, or custom backend endpoint
    try {
      if (process.env.NODE_ENV === 'production') {
        // Example: await fetch('/api/log-error', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorDetails)
        // });
        console.log('📊 Error logged to service:', errorDetails.message);
      }
    } catch (e) {
      console.error('Failed to log error to service:', e);
    }
  };
  */

   logErrorToService = async (errorDetails) => {
    // Log to backend audit system
    try {
      await logFrontendAuditEvent('CLIENT_ERROR_OCCURRED', {
        category: 'system',
        severity: this.getErrorSeverity(errorDetails),
        metadata: {
          error_message: errorDetails.message,
          error_type: errorDetails.errorType,
          error_count: errorDetails.errorCount,
          component_stack: errorDetails.componentStack,
          user_agent: errorDetails.userAgent,
          page_url: errorDetails.url,
          timestamp: errorDetails.timestamp,
        },
      });
    } catch (e) {
      console.error('Failed to log error to audit service:', e);
    }
  };

  getErrorSeverity = (errorDetails) => {
    const category = this.getErrorCategory({ message: errorDetails.message });
    switch (category) {
      case 'chunk': return 'high';
      case 'network': return 'medium';
      case 'resize-observer': return 'low';
      default: return 'medium';
    }
  };

  logErrorToAuditService = async (errorDetails) => {
    // Log to backend audit system
    try {
      const response = await fetch('/api/v1/audit-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': sessionStorage.getItem('correlation_id') || crypto.randomUUID()
        },
        body: JSON.stringify({
          event_type: 'CLIENT_ERROR_OCCURRED',
          event_category: 'system',
          severity: this.getErrorSeverity(errorDetails),
          actor_type: 'user',
          metadata: {
            error_message: errorDetails.message,
            error_type: errorDetails.errorType,
            error_count: errorDetails.errorCount,
            component_stack: errorDetails.componentStack,
            user_agent: errorDetails.userAgent,
            page_url: errorDetails.url,
            timestamp: errorDetails.timestamp
          }
        })
      });
      
      if (!response.ok) {
        console.error('Failed to send audit log:', response.statusText);
      }
    } catch (e) {
      // Fallback to console if audit logging fails
      console.error('Failed to log error to audit service:', e);
    }
  };

  getErrorSeverity = (errorDetails) => {
    const category = this.getErrorCategory({ message: errorDetails.message });
    switch (category) {
      case 'chunk': return 'high';
      case 'network': return 'medium';
      case 'resize-observer': return 'low';
      default: return 'medium';
    }
  };

  handleReload = () => {
    try {
      // Clear any corrupted data
      sessionStorage.clear();
      localStorage.removeItem('cart');
      localStorage.removeItem('lastVisitedPage');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  handleGoHome = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.href = '/';
  };

  handleRecover = () => {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      alert('Maximum recovery attempts reached. Please reload the page.');
      return;
    }

    this.recoveryAttempts++;
    this.setState({ 
      isRecovering: true 
    });

    // Attempt to recover after a brief delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
    }, 500);
  };

  handleClearErrors = () => {
    this.setState({
      errorHistory: [],
      errorCount: 0
    });
  };

  copyErrorDetails = () => {
    const errorText = `
Oshocks Error Report
====================
Time: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Error Message:
${this.state.error?.message || 'Unknown error'}

Stack Trace:
${this.state.error?.stack || 'No stack trace available'}

Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack available'}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy error details');
    });
  };

  getErrorSuggestion = (error) => {
    const category = this.getErrorCategory(error);
    
    switch (category) {
      case 'chunk':
        return 'This usually happens when the app has been updated. Try reloading the page.';
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'resize-observer':
        return 'This is a minor issue. You can try to continue or reload the page.';
      default:
        return 'An unexpected error occurred. Reloading the page usually fixes this.';
    }
  };

  render() {
    if (this.state.hasError) {
      const errorCategory = this.getErrorCategory(this.state.error);
      const canRecover = errorCategory === 'resize-observer' || this.state.errorCount <= 2;
      const suggestion = this.getErrorSuggestion(this.state.error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="text-center p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl">
            {/* Animated Icon */}
            <div className="text-8xl mb-6 animate-bounce">🚴‍♂️</div>
            
            {/* Main Error Message */}
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Oops! Something went wrong
            </h1>
            
            <p className="text-lg text-gray-600 mb-2">
              {this.getShortErrorMessage(this.state.error)}
            </p>
            
            <p className="text-base text-gray-500 mb-8">
              {suggestion}
            </p>

            {/* Error Stats */}
            {this.state.errorCount > 1 && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This error has occurred {this.state.errorCount} time{this.state.errorCount > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {canRecover && this.recoveryAttempts < this.maxRecoveryAttempts && (
                <button
                  onClick={this.handleRecover}
                  disabled={this.state.isRecovering}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {this.state.isRecovering ? '⏳ Recovering...' : '🔧 Try to Recover'}
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="bg-white text-gray-800 border-2 border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                🏠 Go Home
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <button
                onClick={this.copyErrorDetails}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                📋 Copy Error Details
              </button>
              
              {this.state.errorHistory.length > 0 && (
                <button
                  onClick={this.handleClearErrors}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  🗑️ Clear Error History
                </button>
              )}
            </div>

            {/* Error History */}
            {this.state.errorHistory.length > 1 && (
              <details className="text-left bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer font-semibold text-gray-800 hover:text-gray-900">
                  📊 Error History ({this.state.errorHistory.length} errors)
                </summary>
                <div className="mt-4 space-y-2 max-h-48 overflow-auto">
                  {this.state.errorHistory.map((err, index) => (
                    <div key={index} className="p-2 bg-white rounded border text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-700">#{index + 1}</span>
                        <span className="text-gray-500">
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{err.shortMessage}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer font-semibold text-red-800 mb-2 hover:text-red-900">
                  ⚠️ Developer Error Details
                </summary>
                <div className="space-y-4 mt-4">
                  {/* Error Type and Message */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        {this.state.error.name || 'Error'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Category: {this.getErrorCategory(this.state.error)}
                      </span>
                    </div>
                    <strong className="text-red-600">Message:</strong>
                    <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-red-600">Stack Trace:</strong>
                      <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-64">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-red-600">Component Stack:</strong>
                      <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  {/* Environment Info */}
                  <div>
                    <strong className="text-red-600">Environment:</strong>
                    <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
                      URL: {window.location.href}{'\n'}
                      User Agent: {navigator.userAgent.slice(0, 100)}...{'\n'}
                      Timestamp: {new Date().toISOString()}{'\n'}
                      Recovery Attempts: {this.recoveryAttempts}/{this.maxRecoveryAttempts}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Support Info */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Still having issues?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Our support team is here to help you get back on track.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <a 
                  href="mailto:support@oshocks.co.ke" 
                  className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1"
                >
                  📧 support@oshocks.co.ke
                </a>
                <a 
                  href="tel:+254700000000" 
                  className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1"
                >
                  📞 +254 700 000 000
                </a>
                <button
                  onClick={() => window.Tawk_API?.toggle()}
                  className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1"
                >
                  💬 Live Chat
                </button>
              </div>
            </div>

            {/* Recovery Limit Warning */}
            {this.recoveryAttempts >= this.maxRecoveryAttempts && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-semibold">
                  ⛔ Maximum recovery attempts reached. Please reload the page or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;