// ============================================================================
// REVERB CONFIG — Create React App (uses REACT_APP_* prefix)
// ============================================================================

const getReverbConfig = () => {
  const isProduction = import.meta.env.PROD;
  
  return {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'oshocks-local-key',
    host: import.meta.env.VITE_REVERB_HOST || (isProduction ? window.location.hostname : 'localhost'),
    port: parseInt(import.meta.env.VITE_REVERB_PORT || (isProduction ? 443 : 8080)),
    scheme: import.meta.env.VITE_REVERB_SCHEME || (isProduction ? 'https' : 'http'),
  };
};

export default getReverbConfig;
