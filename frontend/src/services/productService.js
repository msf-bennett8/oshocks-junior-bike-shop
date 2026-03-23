import api from './api';

const productService = {
  // Get all products with filters
  getAllProducts: async (params = {}) => {
    try {
      // Map frontend sort values to backend params
      const backendParams = { ...params };
      
      // Handle sort mapping
      if (params.sort) {
        const sortMapping = {
          'latest': { sort_by: 'created_at', sort_order: 'desc' },
          'price_low': { sort_by: 'price', sort_order: 'asc' },
          'price_high': { sort_by: 'price', sort_order: 'desc' },
          'popular': { sort_by: 'sales', sort_order: 'desc' }
        };
        
        const mappedSort = sortMapping[params.sort];
        if (mappedSort) {
          backendParams.sort_by = mappedSort.sort_by;
          backendParams.sort_order = mappedSort.sort_order;
          delete backendParams.sort; // Remove frontend sort key
        }
      }
      
      // Map category to category_id for backend
      if (params.category) {
        backendParams.category_id = params.category;
        delete backendParams.category;
      }
      
      // Remove empty params
      Object.keys(backendParams).forEach(key => {
        if (backendParams[key] === '' || backendParams[key] === null || backendParams[key] === undefined) {
          delete backendParams[key];
        }
      });
      
      const response = await api.get('/products', { params: backendParams });
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

  // Get product sections (featured, new arrivals, etc.)
  getProductSections: async (perSection = 6) => {
    try {
      const response = await api.get('/products/sections', {
        params: { per_section: perSection }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product sections:', error);
      throw error;
    }
  },
};

export default productService;