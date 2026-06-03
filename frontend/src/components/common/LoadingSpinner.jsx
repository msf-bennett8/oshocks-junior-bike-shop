import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  message = 'Loading...', 
  variant = 'default',
  color = 'purple',
  overlay = true 
}) => {
  
  // Size configurations
  const sizeClasses = {
    xs: { spinner: 'w-3 h-3 border-2', text: 'text-xs', icon: 'text-lg' },
    sm: { spinner: 'w-4 h-4 border-2', text: 'text-sm', icon: 'text-xl' },
    md: { spinner: 'w-8 h-8 border-3', text: 'text-base', icon: 'text-3xl' },
    lg: { spinner: 'w-12 h-12 border-4', text: 'text-lg', icon: 'text-5xl' },
    xl: { spinner: 'w-16 h-16 border-4', text: 'text-xl', icon: 'text-6xl' },
    '2xl': { spinner: 'w-24 h-24 border-6', text: 'text-2xl', icon: 'text-8xl' }
  };

  // Color configurations
  const colorClasses = {
    purple: {
      spinner: 'border-purple-200 border-t-purple-600',
      gradient: 'from-purple-600 to-indigo-600',
      dot: 'bg-purple-600',
      text: 'text-purple-600'
    },
    blue: {
      spinner: 'border-blue-200 border-t-blue-600',
      gradient: 'from-blue-600 to-cyan-600',
      dot: 'bg-blue-600',
      text: 'text-blue-600'
    },
    green: {
      spinner: 'border-green-200 border-t-green-600',
      gradient: 'from-green-600 to-emerald-600',
      dot: 'bg-green-600',
      text: 'text-green-600'
    },
    red: {
      spinner: 'border-red-200 border-t-red-600',
      gradient: 'from-red-600 to-pink-600',
      dot: 'bg-red-600',
      text: 'text-red-600'
    },
    gray: {
      spinner: 'border-gray-200 border-t-gray-600',
      gradient: 'from-gray-600 to-gray-800',
      dot: 'bg-gray-600',
      text: 'text-gray-600'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const currentColor = colorClasses[color] || colorClasses.purple;

  // Spinner Variants
  const spinnerVariants = {
    // Default circular spinner
    default: (
      <div 
        className={`animate-spin rounded-full ${currentColor.spinner} ${currentSize.spinner}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Dots spinner
    dots: (
      <div className="flex items-center gap-2" role="status" aria-label="Loading">
        <span className={`${currentColor.dot} rounded-full animate-bounce ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ animationDelay: '0ms' }}></span>
        <span className={`${currentColor.dot} rounded-full animate-bounce ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ animationDelay: '150ms' }}></span>
        <span className={`${currentColor.dot} rounded-full animate-bounce ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ animationDelay: '300ms' }}></span>
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Pulse spinner
    pulse: (
      <div className="relative" role="status" aria-label="Loading">
        <div className={`${currentColor.dot} rounded-full ${currentSize.spinner} animate-ping absolute opacity-75`}></div>
        <div className={`${currentColor.dot} rounded-full ${currentSize.spinner}`}></div>
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Bars spinner
    bars: (
      <div className="flex items-end gap-1" role="status" aria-label="Loading">
        {[0, 150, 300].map((delay, index) => (
          <div
            key={index}
            className={`${currentColor.dot} rounded-sm animate-pulse ${
              size === 'sm' ? 'w-1 h-4' : 
              size === 'lg' ? 'w-3 h-8' : 
              'w-2 h-6'
            }`}
            style={{ animationDelay: `${delay}ms` }}
          ></div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Double ring spinner
    ring: (
      <div className="relative" role="status" aria-label="Loading">
        <div className={`animate-spin rounded-full ${currentColor.spinner} ${currentSize.spinner}`}></div>
        <div className={`absolute inset-2 animate-spin-reverse rounded-full ${currentColor.spinner} border-t-transparent`}></div>
        <span className="sr-only">Loading...</span>
        <style jsx>{`
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-spin-reverse {
            animation: spin-reverse 1s linear infinite;
          }
        `}</style>
      </div>
    ),

    // Bike emoji spinner (for Oshocks theme)
    bike: (
      <div className="relative" role="status" aria-label="Loading">
        <div className={`animate-spin ${currentSize.icon}`}>🚴‍♂️</div>
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Gradient spinner
    gradient: (
      <div className="relative" role="status" aria-label="Loading">
        <div className={`animate-spin rounded-full bg-gradient-to-tr ${currentColor.gradient} ${currentSize.spinner} opacity-20`}></div>
        <div className={`absolute inset-0 animate-spin rounded-full bg-gradient-to-br ${currentColor.gradient} ${currentSize.spinner}`} style={{ 
          clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' 
        }}></div>
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Grid spinner
    grid: (
      <div className="grid grid-cols-3 gap-1" role="status" aria-label="Loading">
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className={`${currentColor.dot} ${size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'} rounded-sm animate-pulse`}
            style={{ animationDelay: `${index * 100}ms` }}
          ></div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    ),

    // Circle path spinner
    circle: (
      <div className="relative" role="status" aria-label="Loading">
        <svg className={`animate-spin ${currentSize.spinner}`} viewBox="0 0 50 50">
          <circle
            className={`${currentColor.text} opacity-25`}
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
            stroke="currentColor"
          />
          <circle
            className={`${currentColor.text}`}
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
            stroke="currentColor"
            strokeDasharray="80"
            strokeDashoffset="60"
            strokeLinecap="round"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    )
  };

  const spinner = spinnerVariants[variant] || spinnerVariants.default;

  // Full screen loader
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${
        overlay ? 'bg-white bg-opacity-95 backdrop-blur-sm' : ''
      }`}>
        <div className="text-center">
          {/* Brand Logo for full screen */}
          {size !== 'sm' && size !== 'xs' && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-6xl">🚴‍♂️</span>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Oshocks
                  </h1>
                  <p className="text-sm text-gray-500 -mt-1">Junior Bike Shop</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Spinner */}
          <div className="flex justify-center mb-4">
            {spinner}
          </div>
          
          {/* Loading Message */}
          {message && (
            <div className={`${currentSize.text} text-gray-700 font-medium animate-pulse`}>
              {message}
            </div>
          )}
          
          {/* Loading Dots */}
          <div className="flex justify-center gap-1 mt-3">
            <span className={`w-2 h-2 ${currentColor.dot} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></span>
            <span className={`w-2 h-2 ${currentColor.dot} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></span>
            <span className={`w-2 h-2 ${currentColor.dot} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

  // Inline spinner (with optional message)
  return (
    <div className="inline-flex items-center gap-3">
      {spinner}
      {message && (
        <span className={`${currentSize.text} text-gray-600`}>{message}</span>
      )}
    </div>
  );
};

// Additional export: Button Loader
export const ButtonLoader = ({ size = 'sm', color = 'white' }) => {
  return (
    <LoadingSpinner 
      size={size} 
      variant="dots" 
      color={color === 'white' ? 'gray' : color}
    />
  );
};

// Additional export: Card Loader
export const CardLoader = ({ count = 1, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

// Additional export: Table Loader
export const TableLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full">
      <div className="animate-pulse space-y-3">
        {/* Header */}
        <div className="flex gap-4 pb-3 border-b">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 py-3 border-b border-gray-100">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Additional export: Progress Loader
export const ProgressLoader = ({ progress = 0, message = '', color = 'purple' }) => {
  const colorClasses = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div className="w-full">
      {message && (
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>{message}</span>
          <span className="font-semibold">{progress}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color] || colorClasses.purple} transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;