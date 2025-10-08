export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  CART: '/cart',
  LOGIN: '/login',
  REGISTER: '/register',
};

export const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  CARD: 'card',
};

export default {
  API_BASE_URL,
  ROUTES,
  PAYMENT_METHODS,
};
