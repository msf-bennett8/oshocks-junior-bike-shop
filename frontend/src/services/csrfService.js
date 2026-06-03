import axios from 'axios';
import dataSourceManager from './dataSourceManager';

const getApiUrl = () => dataSourceManager.getApiUrl();
const getCsrfUrl = () => getApiUrl().replace('/api/v1', '/sanctum/csrf-cookie');

let csrfPromise = null;

export const fetchCsrfCookie = async () => {
  // Prevent multiple simultaneous CSRF requests
  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = axios.get(getCsrfUrl(), {
    withCredentials: true
  }).then(() => {
    console.log('🍪 CSRF cookie fetched successfully');
    csrfPromise = null;
  }).catch(err => {
    console.error('❌ CSRF fetch failed:', err.message);
    csrfPromise = null;
    throw err;
  });

  return csrfPromise;
};

export default { fetchCsrfCookie };
