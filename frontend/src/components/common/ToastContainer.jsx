import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ============================================================================
// TOAST CONTEXT & PROVIDER
// ============================================================================

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const {
      message,
      type = 'info',
      duration = 5000,
      dismissible = true,
      action = null,
      onAction = null,
      persistent = false
    } = typeof options === 'string' ? { message: options } : options;

    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      dismissible,
      action,
      onAction,
      persistent
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ message, type: 'error', duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ message, type: 'loading', persistent: true, dismissible: false, ...options });
  }, [addToast]);

  const promise = useCallback(async (promise, messages) => {
    const loadingId = loading(messages.loading || 'Loading...');
    
    try {
      const result = await promise;
      removeToast(loadingId);
      success(messages.success || 'Success!');
      return result;
    } catch (err) {
      removeToast(loadingId);
      error(messages.error || 'Something went wrong');
      throw err;
    }
  }, [loading, removeToast, success, error]);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
        loading,
        promise
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} position={position} />
    </ToastContext.Provider>
  );
};

// ============================================================================
// TOAST CONTAINER COMPONENT
// ============================================================================

const ToastContainer = ({ toasts, removeToast, position }) => {
  if (toasts.length === 0) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none`}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

// ============================================================================
// INDIVIDUAL TOAST COMPONENT
// ============================================================================

const Toast = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.persistent || toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, toast.persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
    }
    handleClose();
  };

  const typeConfig = {
    success: {
      bg: 'bg-green-50 border-green-400',
      text: 'text-green-800',
      icon: '✓',
      iconBg: 'bg-green-400',
      progressBar: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-400',
      text: 'text-red-800',
      icon: '✕',
      iconBg: 'bg-red-400',
      progressBar: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-400',
      text: 'text-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-400',
      progressBar: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-400',
      text: 'text-blue-800',
      icon: 'i',
      iconBg: 'bg-blue-400',
      progressBar: 'bg-blue-500'
    },
    loading: {
      bg: 'bg-gray-50 border-gray-400',
      text: 'text-gray-800',
      icon: '⟳',
      iconBg: 'bg-gray-400',
      progressBar: 'bg-gray-500'
    }
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      className={`
        ${config.bg} ${config.text} 
        border-l-4 rounded-lg shadow-lg p-4 
        pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconBg} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm ${toast.type === 'loading' ? 'animate-spin' : ''}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed break-words">
            {toast.message}
          </p>

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="mt-2 text-xs font-semibold underline hover:no-underline transition-all"
            >
              {toast.action}
            </button>
          )}
        </div>

        {/* Close Button */}
        {toast.dismissible && (
          <button
            onClick={handleClose}
            className="text-lg hover:opacity-70 transition-opacity flex-shrink-0 w-6 h-6 flex items-center justify-center"
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {!toast.persistent && toast.duration > 0 && (
        <div className="mt-2 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressBar} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DEMO COMPONENT
// ============================================================================

const ToastDemo = () => {
  const toast = useToast();

  const demoActions = [
    {
      label: 'Success Toast',
      action: () => toast.success('Product added to cart successfully!'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Error Toast',
      action: () => toast.error('Failed to process payment. Please try again.'),
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      label: 'Warning Toast',
      action: () => toast.warning('Your session will expire in 5 minutes.'),
      color: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      label: 'Info Toast',
      action: () => toast.info('New cycling gear collection now available!'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Loading Toast',
      action: () => {
        const id = toast.loading('Processing your order...');
        setTimeout(() => {
          toast.removeToast(id);
          toast.success('Order placed successfully!');
        }, 3000);
      },
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      label: 'Toast with Action',
      action: () => toast.success('Item added to wishlist!', {
        action: 'View Wishlist',
        onAction: () => console.log('Navigate to wishlist')
      }),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Promise Toast',
      action: () => {
        const fakeApi = new Promise((resolve, reject) => {
          setTimeout(() => Math.random() > 0.5 ? resolve() : reject(), 2000);
        });
        
        toast.promise(fakeApi, {
          loading: 'Saving changes...',
          success: 'Changes saved successfully!',
          error: 'Failed to save changes'
        });
      },
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      label: 'Persistent Toast',
      action: () => toast.info('This notification stays until dismissed.', {
        persistent: true,
        action: 'Learn More',
        onAction: () => console.log('Learn more clicked')
      }),
      color: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      label: 'Clear All',
      action: () => toast.clearAllToasts(),
      color: 'bg-gray-800 hover:bg-gray-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Enhanced Toast System
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive notification system for Oshocks Junior Bike Shop
          </p>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Multiple toast types (success, error, warning, info, loading)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Configurable positions (6 options)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Auto-dismiss with progress bar</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Persistent notifications option</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Action buttons with callbacks</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Promise-based notifications</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Smooth animations & transitions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Accessibility compliant (ARIA)</span>
            </div>
          </div>
        </div>

        {/* Demo Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Try It Out</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoActions.map((demo, index) => (
              <button
                key={index}
                onClick={demo.action}
                className={`${demo.color} text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md`}
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Example</h2>
          <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-x-auto text-gray-800 border border-gray-200">
{`// Basic usage
toast.success('Order placed!');
toast.error('Payment failed');

// With options
toast.info('New message', {
  duration: 10000,
  action: 'View',
  onAction: () => navigate('/messages')
});

// Promise handling
toast.promise(apiCall, {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save'
});

// Persistent notification
toast.warning('Maintenance scheduled', {
  persistent: true
});`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// APP WRAPPER
// ============================================================================

export default function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <ToastDemo />
    </ToastProvider>
  );
}