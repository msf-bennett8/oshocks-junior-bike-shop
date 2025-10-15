// ============================================================================
// API SERVICE - Centralized API calls with detailed logging
// ============================================================================

import axios from 'axios';

// Base API URL - NO /v1/ because your Laravel routes don't have it
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://oshocks-junior-bike-shop-backend.onrender.com/api/v1';

console.log('🌐 API Service Initialized');
console.log('📍 Base URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    console.log('📤 Outgoing Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
    });
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Auth token added to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      fullURL: `${response.config.baseURL}${response.config.url}`,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('🔴 API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      });
      
      if (error.response.status === 401) {
        console.warn('🔒 Unauthorized - clearing token');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('🔴 Network Error:', {
        message: error.message,
        baseURL: error.config?.baseURL,
        url: error.config?.url
      });
    } else {
      console.error('🔴 Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// PRODUCT API ENDPOINTS
// ============================================================================

export const productAPI = {
  getProducts: (params = {}) => {
    console.log('🛍️ Fetching products with params:', params);
    return api.get('/products', { params });
  },

  getProduct: (id) => {
    console.log('🔍 Fetching product by ID:', id);
    return api.get(`/products/${id}`);
  },

  getProductBySlug: (slug) => {
    console.log('🔍 Fetching product by slug:', slug);
    return api.get(`/products/slug/${slug}`);
  },

  searchProducts: (query) => {
    console.log('🔎 Searching products with query:', query);
    return api.get('/products', { params: { search: query } });
  },

  getProductsByCategory: (categoryId) => {
    console.log('📂 Fetching products by category:', categoryId);
    return api.get('/products', { params: { category_id: categoryId } });
  },

  getProductsByBrand: (brand) => {
    console.log('🏷️ Fetching products by brand:', brand);
    return api.get('/products', { params: { brand } });
  },
};

// ============================================================================
// CATEGORY API ENDPOINTS
// ============================================================================

export const categoryAPI = {
  getCategories: () => {
    console.log('📂 Fetching all categories');
    return api.get('/categories');
  },

  getCategory: (id) => {
    console.log('📂 Fetching category by ID:', id);
    return api.get(`/categories/${id}`);
  },

  getCategoryProducts: (id) => {
    console.log('📂 Fetching products for category:', id);
    return api.get(`/categories/${id}/products`);
  },
};

// ============================================================================
// AUTHENTICATION API ENDPOINTS
// ============================================================================

export const authAPI = {
  login: (credentials) => {
    console.log('🔐 Attempting login for:', credentials.email);
    return api.post('/auth/login', credentials);
  },

  register: (userData) => {
    console.log('📝 Registering new user:', userData.email);
    return api.post('/auth/register', userData);
  },

  logout: () => {
    console.log('👋 Logging out user');
    return api.post('/auth/logout');
  },

  getCurrentUser: () => {
    console.log('👤 Fetching current user');
    return api.get('/user');
  },
};

// ============================================================================
// CART API ENDPOINTS
// ============================================================================

export const cartAPI = {
  getCart: () => {
    console.log('🛒 Fetching cart');
    return api.get('/cart');
  },

  addToCart: (item) => {
    console.log('➕ Adding item to cart:', item);
    return api.post('/cart/items', item);
  },

  updateCartItem: (id, data) => {
    console.log('✏️ Updating cart item:', id, data);
    return api.put(`/cart/items/${id}`, data);
  },

  removeFromCart: (id) => {
    console.log('➖ Removing item from cart:', id);
    return api.delete(`/cart/items/${id}`);
  },

  clearCart: () => {
    console.log('🗑️ Clearing cart');
    return api.delete('/cart/clear');
  },
};

// Export default api instance
export default api;