// ============================================================================
// REVERB CONFIG — Create React App (uses REACT_APP_* prefix)
// ============================================================================

const getReverbConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    key: process.env.REACT_APP_REVERB_APP_KEY || 'oshocks-local-key',
    host: process.env.REACT_APP_REVERB_HOST || (isProduction ? window.location.hostname : 'localhost'),
    port: parseInt(process.env.REACT_APP_REVERB_PORT || (isProduction ? 443 : 8080)),
    scheme: process.env.REACT_APP_REVERB_SCHEME || (isProduction ? 'https' : 'http'),
  };
};

export default getReverbConfig;
