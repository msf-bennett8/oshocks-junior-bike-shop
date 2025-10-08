const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
      
      // FID is deprecated, use INP instead
      if (onINP) {
        onINP(onPerfEntry);
      }
    }).catch(err => {
      console.warn('Web Vitals could not be loaded:', err);
    });
  }
};

export default reportWebVitals;
