import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);

    // FID is deprecated, use INP instead
    if (onINP) {
      onINP(onPerfEntry);
    }
  }
};

export default reportWebVitals;