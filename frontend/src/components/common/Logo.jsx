import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Oshocks Logo Component
 * - OS in Lobster Two font (inside square)
 * - Oshocks in script font (Pacifico - similar to Clipper Script)
 * - Unified orange-red to orange gradient
 * - Perfect square shape
 */
const Logo = ({ 
  size = 'default',
  asLink = true,
  className = '' 
}) => {
  const sizes = {
    small: {
      container: 'w-10 h-10',
      osText: 'text-lg',
      brand: 'text-xl',
      tagline: 'text-[10px]'
    },
    default: {
      container: 'w-12 h-12',
      osText: 'text-xl',
      brand: 'text-2xl',
      tagline: 'text-xs'
    },
    large: {
      container: 'w-14 h-14',
      osText: 'text-2xl',
      brand: 'text-3xl',
      tagline: 'text-sm'
    }
  };

  const currentSize = sizes[size] || sizes.default;

  const logoContent = (
    <div className={`flex items-center gap-3 flex-shrink-0 ${className}`}>
      {/* Perfect Square with OS */}
      <div 
        className={`${currentSize.container} rounded-lg flex items-end justify-start p-1.5 flex-shrink-0`}
        style={{
          background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
          aspectRatio: '1/1'
        }}
      >
        {/* OS Text - Lobster Two font */}
        <span 
          className={`${currentSize.osText} font-bold text-white leading-none`}
          style={{
            fontFamily: '"Lobster Two", cursive',
            transform: 'translateX(-5%) translateY(5%)'
          }}
        >
          OS
        </span>
      </div>
      
      {/* Brand Text - Pacifico (similar to Clipper Script) */}
      <div className="flex flex-col">
        <span 
          className={`${currentSize.brand} font-bold bg-clip-text text-transparent`}
          style={{
            fontFamily: '"Pacifico", cursive',
            backgroundImage: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
            letterSpacing: '0.02em'
          }}
        >
          Oshocks
        </span>
        <span className={`${currentSize.tagline} text-gray-600 hidden sm:block font-sans`}>
          Bike Shop
        </span>
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;