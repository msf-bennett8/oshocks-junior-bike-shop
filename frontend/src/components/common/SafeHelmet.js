// src/components/common/SafeHelmet.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SafeHelmet Component
 * Wrapper around react-helmet-async that ensures all values are valid strings
 * Prevents "Helmet expects a string" errors
 */
const SafeHelmet = ({ 
  title = 'Oshocks Junior Bike Shop', 
  description = 'Kenya\'s Premier Cycling Marketplace',
  children,
  ...props 
}) => {
  // Ensure title is always a string
  const safeTitle = String(title || 'Oshocks Junior Bike Shop');
  const safeDescription = String(description || 'Kenya\'s Premier Cycling Marketplace');

  return (
    <Helmet {...props}>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      {children}
    </Helmet>
  );
};

export default SafeHelmet;
