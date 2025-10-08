import React from 'react';

const Loader = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: {
      container: 'w-32 h-32',
      duck: 'text-4xl',
      text: 'text-sm'
    },
    medium: {
      container: 'w-48 h-48',
      duck: 'text-6xl',
      text: 'text-base'
    },
    large: {
      container: 'w-64 h-64',
      duck: 'text-8xl',
      text: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Swimming Duck in Circle Water */}
      <div className={`relative ${currentSize.container} mb-6`}>
        {/* Outer Circle Border */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        
        {/* Animated Water Fill (Left to Right) */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="water-fill-animation absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full"></div>
        </div>

        {/* Water Ripples */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="ripple-1 absolute inset-0 border-4 border-blue-300 rounded-full opacity-0"></div>
          <div className="ripple-2 absolute inset-0 border-4 border-cyan-300 rounded-full opacity-0"></div>
          <div className="ripple-3 absolute inset-0 border-4 border-blue-200 rounded-full opacity-0"></div>
        </div>

        {/* Swimming Duck */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="duck-swim">
            <span className={`${currentSize.duck} filter drop-shadow-lg`}>🦆</span>
          </div>
        </div>

        {/* Water Waves on Top */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="wave-animation absolute top-1/2 left-0 right-0 h-1/2">
            <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path 
                fill="rgba(59, 130, 246, 0.3)" 
                d="M0,160L48,154.7C96,149,192,139,288,133.3C384,128,480,128,576,138.7C672,149,768,171,864,165.3C960,160,1056,128,1152,122.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <p className={`${currentSize.text} font-semibold text-gray-700 mb-2`}>
          {message}
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="loading-dot w-2 h-2 bg-purple-600 rounded-full"></span>
          <span className="loading-dot w-2 h-2 bg-indigo-600 rounded-full animation-delay-200"></span>
          <span className="loading-dot w-2 h-2 bg-blue-600 rounded-full animation-delay-400"></span>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        /* Water Fill Animation - Left to Right */
        @keyframes waterFill {
          0% {
            clip-path: inset(0 100% 0 0);
          }
          50% {
            clip-path: inset(0 0 0 0);
          }
          100% {
            clip-path: inset(0 0 0 100%);
          }
        }

        .water-fill-animation {
          animation: waterFill 3s ease-in-out infinite;
        }

        /* Duck Swimming Animation */
        @keyframes duckSwim {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          25% {
            transform: translateY(-8px) rotate(0deg);
          }
          50% {
            transform: translateY(0) rotate(5deg);
          }
          75% {
            transform: translateY(-6px) rotate(0deg);
          }
        }

        .duck-swim {
          animation: duckSwim 2s ease-in-out infinite;
        }

        /* Water Ripples */
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .ripple-1 {
          animation: ripple 2s ease-out infinite;
        }

        .ripple-2 {
          animation: ripple 2s ease-out infinite 0.7s;
        }

        .ripple-3 {
          animation: ripple 2s ease-out infinite 1.4s;
        }

        /* Wave Animation */
        @keyframes wave {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .wave-animation svg {
          animation: wave 3s linear infinite;
        }

        /* Loading Dots */
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .loading-dot {
          animation: bounce 1.4s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

// Fullscreen Loader Component
export const FullScreenLoader = ({ message = 'Loading...', showLogo = true }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {showLogo && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-6xl">🚴‍♂️</span>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Oshocks
                </h1>
                <p className="text-sm text-gray-500">Junior Bike Shop</p>
              </div>
            </div>
          </div>
        )}
        <Loader message={message} size="large" />
      </div>
    </div>
  );
};

// Inline Loader Component (for buttons, etc.)
export const InlineLoader = ({ size = 'small', className = '' }) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="relative w-6 h-6">
        <div className="duck-spin text-lg">🦆</div>
      </div>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .duck-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Skeleton Loader for Content
export const SkeletonLoader = ({ count = 1, height = 'h-4', className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
