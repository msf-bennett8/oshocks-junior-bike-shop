//frontend/src/redux/slices/productslice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const data = await productService.getAllProducts(params);
      return {
        ...data,
        shouldReplace: params?.page === 1 || params?.shouldReplace !== false
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const { query, type = 'all' } = typeof params === 'string' ? { query: params } : params;
      const data = await productService.searchProducts(query, type);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productService.getProductById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const deleteProductAction = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProductAction = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.createProduct(productData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProductAction = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, updates }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(productId, updates);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkDeleteProductsAction = createAsyncThunk(
  'products/bulkDelete',
  async (productIds, { rejectWithValue }) => {
    try {
      await productService.bulkDeleteProducts(productIds);
      return productIds;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateProductsAction = createAsyncThunk(
  'products/bulkUpdate',
  async ({ productIds, updates }, { rejectWithValue }) => {
    try {
      await productService.bulkUpdateProducts(productIds, updates);
      return { productIds, updates };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    categories: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      perPage: 12,
      total: 0,
      hasMore: false,
    },
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProducts: (state) => {
      state.items = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        perPage: 12,
        total: 0,
        hasMore: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        // Only clear error on new search/filter, not on pagination
        if (action.meta.arg?.page === 1) {
          state.error = null;
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.data || action.payload;
        const shouldReplace = action.payload.shouldReplace;
        
        // Replace items on new search/filter, append on pagination
        if (shouldReplace) {
          state.items = Array.isArray(newItems) ? newItems : [];
        } else {
          // Append new items, avoiding duplicates
          const existingIds = new Set(state.items.map(item => item.id));
          const uniqueNewItems = Array.isArray(newItems) 
            ? newItems.filter(item => !existingIds.has(item.id))
            : [];
          state.items = [...state.items, ...uniqueNewItems];
        }
        
        // Update pagination
        const currentPage = action.payload.current_page || 1;
        const totalPages = action.payload.last_page || 1;
        
        state.pagination = {
          currentPage: currentPage,
          totalPages: totalPages,
          perPage: action.payload.per_page || 12,
          total: action.payload.total || state.items.length,
          hasMore: currentPage < totalPages,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })

      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        console.log('✅ Search fulfilled:', action.payload);
        state.searchLoading = false;
        state.searchResults = action.payload.data || action.payload;
        console.log('📦 Search results stored:', state.searchResults);
      })
      .addCase(searchProducts.rejected, (state, action) => {
        console.error('❌ Search rejected:', action.payload);
        state.searchLoading = false;
        const error = action.payload;
        state.searchError = typeof error === 'string' 
          ? error 
          : error?.message || 'Search failed';
        state.searchResults = [];
      })
      
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.data || action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product';
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })
      // Delete Product
      .addCase(deleteProductAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteProductAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      })
      
      // Create Product
      .addCase(createProductAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProductAction.fulfilled, (state, action) => {
        state.loading = false;
        const newProduct = action.payload.data || action.payload;
        state.items = [newProduct, ...state.items];
      })
      .addCase(createProductAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create product';
      })
      
      // Update Product
      .addCase(updateProductAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data || action.payload;
        state.items = state.items.map(item => 
          item.id === updatedProduct.id ? updatedProduct : item
        );
      })
      .addCase(updateProductAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      })
      
      // Bulk Delete
      .addCase(bulkDeleteProductsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkDeleteProductsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => !action.payload.includes(item.id));
      })
      .addCase(bulkDeleteProductsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to bulk delete products';
      })
      
      // Bulk Update
      .addCase(bulkUpdateProductsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateProductsAction.fulfilled, (state, action) => {
        state.loading = false;
        const { productIds, updates } = action.payload;
        state.items = state.items.map(item => 
          productIds.includes(item.id) ? { ...item, ...updates } : item
        );
      })
      .addCase(bulkUpdateProductsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to bulk update products';
      });
  },
});

export const { clearCurrentProduct, clearError, resetProducts } = productSlice.actions;
export default productSlice.reducer;