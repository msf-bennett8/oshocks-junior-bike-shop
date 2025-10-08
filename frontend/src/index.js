import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import store from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/common/ToastContainer'; // ADD THIS IMPORT
import reportWebVitals from './reportWebVitals';

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================
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
    
    // Log error details
    console.error('🚨 Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Log to external error tracking service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorCount: errorCount
    });

    // If too many errors, prevent infinite error loops
    if (errorCount > 5) {
      console.error('⚠️ Too many errors detected. Please refresh the page.');
    }
  }

  logErrorToService(error, errorInfo) {
    // Example: Send to Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack
    //       }
    //     }
    //   });
    // }

    // Example: Send to custom logging endpoint
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }).catch(err => console.error('Failed to log error:', err));
      } catch (loggingError) {
        console.error('Error logging failed:', loggingError);
      }
    }
  }

  handleReload = () => {
    // Clear any corrupted state before reload
    try {
      sessionStorage.clear();
      localStorage.removeItem('__corrupted_state__');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ 
              fontSize: '64px', 
              marginBottom: '20px',
              lineHeight: '1'
            }}>
              🚴‍♂️
            </h1>
            <h2 style={{ 
              fontSize: '28px', 
              marginBottom: '16px',
              color: '#1a1a1a',
              fontWeight: '700'
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: '#6c757d',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              We're sorry for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#5568d3';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#667eea',
                  backgroundColor: 'white',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f8f9ff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                🏠 Go Home
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '32px', 
                textAlign: 'left',
                fontSize: '14px',
                color: '#6c757d'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  color: '#856404'
                }}>
                  ⚠️ Error Details (Development Only)
                </summary>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginTop: '8px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: '#dc3545' }}>Error Message:</strong>
                    <pre style={{
                      margin: '8px 0',
                      padding: '12px',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px',
                      border: '1px solid #dee2e6'
                    }}>
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#dc3545' }}>Stack Trace:</strong>
                      <pre style={{
                        margin: '8px 0',
                        padding: '12px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '11px',
                        border: '1px solid #dee2e6',
                        maxHeight: '200px'
                      }}>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <div>
                      <strong style={{ color: '#dc3545' }}>Component Stack:</strong>
                      <pre style={{
                        margin: '8px 0',
                        padding: '12px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '11px',
                        border: '1px solid #dee2e6',
                        maxHeight: '200px'
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Information */}
            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Need help?</strong>
              </p>
              <p style={{ margin: 0 }}>
                Contact us at{' '}
                <a 
                  href="mailto:support@oshocks.co.ke"
                  style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}
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

// ... [Keep all the monitoring and helper functions exactly as they are]

function initializeMonitoring() {
  reportWebVitals((metric) => {
    const { name, value, id, delta } = metric;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}:`, {
        value: Math.round(value),
        delta: Math.round(delta),
        id,
        rating: getRating(name, value)
      });
    }
    
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        event_label: id,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true,
        metric_id: id,
        metric_value: value,
        metric_delta: delta
      });
    }

    if (process.env.NODE_ENV === 'production') {
      sendMetricToAnalytics(metric);
    }
  });
}

function getRating(name, value) {
  const thresholds = {
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800]
  };

  const [good, needsImprovement] = thresholds[name] || [0, 0];
  
  if (value <= good) return '✅ Good';
  if (value <= needsImprovement) return '⚠️ Needs Improvement';
  return '❌ Poor';
}

function sendMetricToAnalytics(metric) {
  try {
    const body = JSON.stringify({
      ...metric,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    } else {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    }
  } catch (error) {
    console.error('Failed to send metric:', error);
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

function showUpdateNotification() {
  const shouldUpdate = window.confirm(
    '🎉 A new version of Oshocks is available!\n\nWould you like to update now?'
  );
  
  if (shouldUpdate) {
    window.location.reload();
  }
}

function initializeNetworkMonitoring() {
  let onlineStatus = navigator.onLine;

  window.addEventListener('online', () => {
    if (!onlineStatus) {
      console.log('✅ Connection restored');
      onlineStatus = true;
      
      store.dispatch({ 
        type: 'NETWORK_STATUS_CHANGED', 
        payload: { online: true } 
      });
      
      showNetworkNotification('online');
      retryFailedRequests();
    }
  });

  window.addEventListener('offline', () => {
    if (onlineStatus) {
      console.log('⚠️ Connection lost');
      onlineStatus = false;
      
      store.dispatch({ 
        type: 'NETWORK_STATUS_CHANGED', 
        payload: { online: false } 
      });
      
      showNetworkNotification('offline');
    }
  });

  if (navigator.connection) {
    navigator.connection.addEventListener('change', () => {
      const { effectiveType, downlink, rtt } = navigator.connection;
      console.log('📶 Connection changed:', { effectiveType, downlink, rtt });
      
      if (store && typeof store.dispatch === 'function') {
        store.dispatch({
          type: 'CONNECTION_QUALITY_CHANGED',
          payload: { effectiveType, downlink, rtt }
        });
      }
    });
  }
}

function showNetworkNotification(status) {
  console.log(`Network status: ${status}`);
}

function retryFailedRequests() {
  console.log('🔄 Retrying failed requests...');
}

function monitorLongTasks() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) {
            console.warn('⚠️ Long task detected:', {
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
              name: entry.name
            });
            
            if (process.env.NODE_ENV === 'production') {
              sendMetricToAnalytics({
                name: 'LONG_TASK',
                value: entry.duration,
                startTime: entry.startTime
              });
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task monitoring not supported');
    }
  }
}

function monitorLayoutShifts() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput && entry.value > 0.1) {
            console.warn('⚠️ Large layout shift:', {
              value: entry.value.toFixed(4),
              sources: entry.sources?.map(s => ({
                node: s.node,
                currentRect: s.currentRect,
                previousRect: s.previousRect
              }))
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Layout shift monitoring not supported');
    }
  }
}

function detectBrowserFeatures() {
  const html = document.documentElement;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) html.classList.add('mobile-device');
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) html.classList.add('ios-device');
  
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) html.classList.add('safari-browser');
  
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (hasTouch) html.classList.add('touch-device');
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) html.classList.add('standalone-mode');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Device Info:', {
      isMobile,
      isIOS,
      isSafari,
      hasTouch,
      isStandalone,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'unknown'
    });
  }
}

function initializeSecurity() {
  if (process.env.NODE_ENV === 'production') {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.info = noop;
    console.debug = noop;
    
    const threshold = 160;
    const detect = () => {
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        console.error('⚠️ DevTools detected');
      }
    };
    window.addEventListener('resize', detect);
    detect();
  }
}

window.addEventListener('error', (event) => {
  console.error('❌ Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  if (process.env.NODE_ENV === 'production') {
    sendErrorToService({
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise
  });
  
  if (process.env.NODE_ENV === 'production') {
    sendErrorToService({
      type: 'unhandledRejection',
      reason: event.reason,
      stack: event.reason?.stack
    });
  }
});

function sendErrorToService(errorData) {
  try {
    const body = JSON.stringify({
      ...errorData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      appVersion: process.env.REACT_APP_VERSION || '1.0.0'
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/log-error', body);
    } else {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(console.error);
    }
  } catch (e) {
    console.error('Failed to send error:', e);
  }
}

// ============================================================================
// APPLICATION INITIALIZATION - WITH TOASTPROVIDER ADDED
// ============================================================================

function initializeApp() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Please ensure index.html has a div with id="root"');
  }

  const root = ReactDOM.createRoot(rootElement);

  // CRITICAL FIX: Add ToastProvider to the provider chain
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <HelmetProvider>
              <AuthProvider>
                <CartProvider>
                  <ToastProvider>
                    <App />
                  </ToastProvider>
                </CartProvider>
              </AuthProvider>
            </HelmetProvider>
          </BrowserRouter>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  if (process.env.NODE_ENV === 'development') {
    window.__REDUX_STORE__ = store;
    window.__APP_VERSION__ = process.env.REACT_APP_VERSION || '1.0.0';
    
    console.log(
      '%c🚴‍♂️ Oshocks Junior Bike Shop',
      'color: #667eea; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);'
    );
    console.log(
      '%cDevelopment Mode Active',
      'color: #28a745; font-size: 14px; font-weight: 600;'
    );
    console.log(
      '%c💡 Tips:\n' +
      '   - Redux Store: window.__REDUX_STORE__\n' +
      '   - App Version: window.__APP_VERSION__\n' +
      '   - React DevTools: Install for better debugging',
      'color: #6c757d; font-size: 12px;'
    );
  }
}

if (module.hot) {
  module.hot.accept('./App', () => {
    console.log('🔄 Hot reloading App component...');
  });
  
  module.hot.accept('./redux/store', () => {
    console.log('🔄 Hot reloading Redux store...');
  });
}

detectBrowserFeatures();
initializeSecurity();
initializeMonitoring();
initializeNetworkMonitoring();
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}
monitorLongTasks();
monitorLayoutShifts();

initializeApp();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('👋 Page hidden');
  } else {
    console.log('👀 Page visible');
  }
});

window.addEventListener('beforeunload', (event) => {
  const state = store.getState();
  
  if (state.cart?.items?.length > 0 && !state.cart?.savedToServer) {
    event.preventDefault();
    event.returnValue = 'You have items in your cart. Are you sure you want to leave?';
    return event.returnValue;
  }
});

window.addEventListener('load', () => {
  console.log('✅ Page fully loaded');
  
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ Page Load Time: ${pageLoadTime}ms`);
  }
  
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: 'page_load',
      value: pageLoadTime,
      event_category: 'Performance'
    });
  }
});

if (process.env.NODE_ENV === 'test') {
  window.__TEST_UTILS__ = {
    store,
    ErrorBoundary,
    getRating,
    detectBrowserFeatures
  };
}