// ============================================================================
// AVATAR COMPONENT — Smart fallback: Google avatar → user avatar → initials → default
// ============================================================================

import { useState } from 'react';

const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  'bg-cyan-500', 'bg-lime-500', 'bg-amber-500', 'bg-rose-500',
];

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getColorFromName = (name) => {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const Avatar = ({
  src,
  name,
  alt,
  size = 40,
  className = '',
  rounded = 'full',
  textSize = 'sm',
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Build the image source with fallbacks
  // Priority: passed src prop → name-based initials
  const hasValidSrc = src && typeof src === 'string' && src.trim() !== '' && src !== 'null' && src !== 'undefined';

  const showImage = hasValidSrc && !imgError;
  const initials = getInitials(name || alt);
  const bgColor = getColorFromName(name || alt);
  const roundedClass = rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden ${roundedClass} ${className}`}
      style={{ width: size, height: size }}
      title={name || alt || ''}
    >
      {showImage ? (
        <>
          {!imgLoaded && (
            <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
              <span className={`text-white font-semibold text-${textSize}`}>{initials}</span>
            </div>
          )}
          <img
            src={src}
            alt={name || alt || 'Avatar'}
            className={`w-full h-full object-cover ${roundedClass} transition-opacity duration-200 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
          />
        </>
      ) : (
        <div className={`w-full h-full ${bgColor} flex items-center justify-center ${roundedClass}`}>
          <span className={`text-white font-semibold text-${textSize}`}>{initials}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;