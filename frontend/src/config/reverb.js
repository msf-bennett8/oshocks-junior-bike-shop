// ============================================================================
// REVERB CONFIG — Create React App (uses REACT_APP_* prefix)
// ============================================================================

const getReverbConfig = () => {
  const isProduction = import.meta.env.PROD;

  return {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'oshocks-local-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || (isProduction ? window.location.hostname : 'localhost'),
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || (isProduction ? 443 : 8080)),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || (isProduction ? 443 : 8080)),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || (isProduction ? 'https' : 'http')) === 'https',
    scheme: import.meta.env.VITE_REVERB_SCHEME || (isProduction ? 'https' : 'http'),
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1', // Required by pusher-js
  };
};

export default getReverbConfig;
