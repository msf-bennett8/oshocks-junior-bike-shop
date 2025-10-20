import api from './api';

const productService = {
  // Get all products with filters
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Universal search across all entities
    searchProducts: async (query, type = 'all') => {
      console.log('🔍 ProductService.searchProducts called:', { query, type });
      
      try {
        const response = await api.get('/search', {  // CHANGED FROM /products/search
          params: { q: query, type: type }
        });
        
        console.log('✅ Search API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Search products error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    },

  // Get single product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categorySlug, params = {}) => {
    try {
      const response = await api.get(`/categories/${categorySlug}/products`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default productService;