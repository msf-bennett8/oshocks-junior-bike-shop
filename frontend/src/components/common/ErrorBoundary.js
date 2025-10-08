// ============================================================================
// FILE 1: src/components/common/ErrorBoundary.jsx
// ============================================================================

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorCount = this.state.errorCount + 1;
    
    console.error('🚨 Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo,
      errorCount
    });

    // Prevent infinite error loops
    if (errorCount > 5) {
      console.error('⚠️ Too many errors. Please refresh.');
    }
  }

  handleReload = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-2xl mx-auto">
            <div className="text-8xl mb-6">🚴‍♂️</div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We're sorry for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            
            <div className="flex gap-4 justify-center mb-8">
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

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
                <summary className="cursor-pointer font-semibold text-yellow-800 mb-2">
                  ⚠️ Error Details (Development Only)
                </summary>
                <div className="space-y-4 mt-4">
                  <div>
                    <strong className="text-red-600">Error:</strong>
                    <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-red-600">Stack Trace:</strong>
                      <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-48">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                Need help? Contact us at{' '}
                <a 
                  href="mailto:support@oshocks.co.ke" 
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  support@oshocks.co.ke
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
