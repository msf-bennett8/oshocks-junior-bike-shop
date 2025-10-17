import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://oshocks-junior-bike-shop-backend.onrender.com/api/v1';
const CSRF_URL = API_BASE_URL.replace('/api/v1', '/sanctum/csrf-cookie');

let csrfPromise = null;

export const fetchCsrfCookie = async () => {
  // Prevent multiple simultaneous CSRF requests
  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = axios.get(CSRF_URL, {
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
