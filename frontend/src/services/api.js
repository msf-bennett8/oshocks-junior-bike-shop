// ============================================================================
// API SERVICE - Centralized API calls with detailed logging
// ============================================================================

import axios from 'axios';

// Base API URL - Update this to match your Laravel backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

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
      headers: config.headers,
    });
    
    const token = localStorage.getItem('auth_token');
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
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasData: !!response.data?.data,
      dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('🔴 API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('🔒 Unauthorized - clearing token and redirecting to login');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('🔴 Network Error - No Response:', {
        message: error.message,
        request: error.request,
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
  /**
   * Get all products with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getProducts: (params = {}) => {
    console.log('🛍️ Fetching products with params:', params);
    return api.get('/products', { params });
  },

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise}
   */
  getProduct: (id) => {
    console.log('🔍 Fetching product by ID:', id);
    return api.get(`/products/${id}`);
  },

  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise}
   */
  getProductBySlug: (slug) => {
    console.log('🔍 Fetching product by slug:', slug);
    return api.get(`/products/slug/${slug}`);
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @returns {Promise}
   */
  searchProducts: (query) => {
    console.log('🔎 Searching products with query:', query);
    return api.get('/products', { params: { search: query } });
  },

  /**
   * Get products by category
   * @param {number} categoryId - Category ID
   * @returns {Promise}
   */
  getProductsByCategory: (categoryId) => {
    console.log('📂 Fetching products by category:', categoryId);
    return api.get('/products', { params: { category_id: categoryId } });
  },

  /**
   * Get products by brand
   * @param {string} brand - Brand name
   * @returns {Promise}
   */
  getProductsByBrand: (brand) => {
    console.log('🏷️ Fetching products by brand:', brand);
    return api.get('/products', { params: { brand } });
  },
};

// ============================================================================
// CATEGORY API ENDPOINTS
// ============================================================================

export const categoryAPI = {
  /**
   * Get all categories
   * @returns {Promise}
   */
  getCategories: () => {
    console.log('📂 Fetching all categories');
    return api.get('/categories');
  },

  /**
   * Get single category
   * @param {number} id - Category ID
   * @returns {Promise}
   */
  getCategory: (id) => {
    console.log('📂 Fetching category by ID:', id);
    return api.get(`/categories/${id}`);
  },

  /**
   * Get category products
   * @param {number} id - Category ID
   * @returns {Promise}
   */
  getCategoryProducts: (id) => {
    console.log('📂 Fetching products for category:', id);
    return api.get(`/categories/${id}/products`);
  },
};

// ============================================================================
// AUTHENTICATION API ENDPOINTS
// ============================================================================

export const authAPI = {
  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise}
   */
  login: (credentials) => {
    console.log('🔐 Attempting login for:', credentials.email);
    return api.post('/login', credentials);
  },

  /**
   * Register user
   * @param {Object} userData - User registration data
   * @returns {Promise}
   */
  register: (userData) => {
    console.log('📝 Registering new user:', userData.email);
    return api.post('/register', userData);
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: () => {
    console.log('👋 Logging out user');
    return api.post('/logout');
  },

  /**
   * Get current user
   * @returns {Promise}
   */
  getCurrentUser: () => {
    console.log('👤 Fetching current user');
    return api.get('/user');
  },
};

// ============================================================================
// CART API ENDPOINTS
// ============================================================================

export const cartAPI = {
  /**
   * Get cart
   * @returns {Promise}
   */
  getCart: () => {
    console.log('🛒 Fetching cart');
    return api.get('/cart');
  },

  /**
   * Add item to cart
   * @param {Object} item - Cart item data
   * @returns {Promise}
   */
  addToCart: (item) => {
    console.log('➕ Adding item to cart:', item);
    return api.post('/cart/items', item);
  },

  /**
   * Update cart item
   * @param {number} id - Cart item ID
   * @param {Object} data - Updated data
   * @returns {Promise}
   */
  updateCartItem: (id, data) => {
    console.log('✏️ Updating cart item:', id, data);
    return api.put(`/cart/items/${id}`, data);
  },

  /**
   * Remove cart item
   * @param {number} id - Cart item ID
   * @returns {Promise}
   */
  removeFromCart: (id) => {
    console.log('➖ Removing item from cart:', id);
    return api.delete(`/cart/items/${id}`);
  },

  /**
   * Clear cart
   * @returns {Promise}
   */
  clearCart: () => {
    console.log('🗑️ Clearing cart');
    return api.delete('/cart/clear');
  },
};

// Export default api instance
export default api;