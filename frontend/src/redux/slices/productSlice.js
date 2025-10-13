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
      });
  },
});

export const { clearCurrentProduct, clearError, resetProducts } = productSlice.actions;
export default productSlice.reducer;