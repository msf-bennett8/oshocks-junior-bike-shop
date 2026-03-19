import { useEffect, useState } from 'react';
// Note: Import useLocation from 'react-router-dom' in your project
// import { useLocation } from 'react-router-dom';

const ScrollToTop = ({ 
  smooth = true, 
  showButton = true, 
  showProgress = true,
  threshold = 300,
  pathname = null // Pass pathname from useLocation() hook if using React Router
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll to top on route change
  useEffect(() => {
    if (pathname !== null) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [pathname, smooth]);

  // Handle scroll events for button visibility and progress
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide button based on scroll position
      if (currentScrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate scroll progress
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (currentScrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  if (!showButton) return null;

  return (
    <>
      {/* Scroll Progress Bar - Responsive height */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 sm:h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Scroll to Top Button - Responsive positioning and sizing */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 group"
          aria-label="Scroll to top"
        >
          {/* Button with circular progress */}
          <div className="relative">
            {/* Progress Circle SVG - Responsive sizing */}
            <svg className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="50%"
                cy="50%"
                r="22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - scrollProgress / 100)}`}
                className="text-purple-600 transition-all duration-150"
                strokeLinecap="round"
              />
            </svg>

            {/* Main Button - Responsive sizing */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-lg sm:shadow-xl md:shadow-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/50 group-active:scale-95">
              {/* Arrow Icon - Responsive sizing */}
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white group-hover:animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>

            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-full bg-purple-600 opacity-0 group-hover:opacity-25 group-hover:animate-ping pointer-events-none" />
          </div>

          {/* Tooltip - Hidden on mobile, visible on larger screens */}
          <div className="hidden sm:block absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap shadow-lg">
              Back to Top
              <div className="absolute top-full right-3 sm:right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </button>
      )}
    </>
  );
};

// Alternative: Simple Arrow Button - Responsive
export const SimpleScrollToTop = ({ threshold = 300, pathname = null, smooth = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    if (pathname !== null) {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [pathname, smooth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-3 sm:p-4 rounded-full shadow-lg sm:shadow-xl md:shadow-2xl hover:shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Scroll to top"
    >
      <svg 
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:animate-bounce" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

// Alternative: Corner Button with Text - Adaptive layout
export const CornerScrollToTop = ({ threshold = 300, pathname = null, smooth = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    if (pathname !== null) {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [pathname, smooth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 bg-white border-2 border-purple-600 text-purple-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg sm:shadow-xl hover:bg-purple-600 hover:text-white transition-all duration-300 group flex items-center gap-1.5 sm:gap-2 font-semibold text-sm sm:text-base"
      aria-label="Scroll to top"
    >
      <span className="text-lg sm:text-xl group-hover:animate-bounce">⬆️</span>
      <span className="hidden sm:inline">Back to Top</span>
      <span className="sm:hidden">Top</span>
    </button>
  );
};

// Alternative: Minimal Floating Button - Responsive
export const MinimalScrollToTop = ({ threshold = 300, pathname = null, smooth = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    if (pathname !== null) {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [pathname, smooth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 bg-gray-900 bg-opacity-70 backdrop-blur-sm text-white p-2.5 sm:p-3 md:p-4 rounded-full shadow-md sm:shadow-lg hover:bg-opacity-90 hover:scale-110 transition-all duration-300"
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

// Keyboard Navigation Helper
export const useScrollToTopKeyboard = () => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Home key
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      // Shift + Up Arrow
      if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};

// Scroll Progress Hook (for custom implementations)
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
};

// Scroll Position Hook
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

export default ScrollToTop;