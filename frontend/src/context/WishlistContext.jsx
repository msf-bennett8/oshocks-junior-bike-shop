//src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

// Token is handled automatically by api.js interceptor
// No need for manual token management here

  // Load wishlist from API
    const loadWishlistFromAPI = async () => {
    try {
        setLoading(true);
        const response = await api.get('/wishlist');

        if (response.data) {
        setWishlistItems(response.data.items || []);
        setWishlistCount(response.data.count || 0);
        }
    } catch (error) {
        console.error('Error loading wishlist:', error);
    } finally {
        setLoading(false);
    }
    };

  // Check if item is in wishlist
  const isInWishlist = (productId, variantId = null) => {
    return wishlistItems.some(
      item => item.product_id === productId && item.variant?.id === variantId
    );
  };

    // Add to wishlist
    const addToWishlist = async (product, variant = null) => {
    try {
        setLoading(true);

        const payload = {
        product_id: product.id,
        variant_id: variant?.id || null
        };

        const response = await api.post('/wishlist/add', payload);

        if (response.data) {
        // Reload wishlist to get updated data
        await loadWishlistFromAPI();
        return { success: true, message: response.data.message };
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to wishlist' 
        };
    } finally {
        setLoading(false);
    }
    };

    // Remove from wishlist
    const removeFromWishlist = async (itemId) => {
    try {
        setLoading(true);

        await api.delete(`/wishlist/items/${itemId}`);

        // Reload wishlist
        await loadWishlistFromAPI();
        return { success: true };
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: 'Failed to remove from wishlist' };
    } finally {
        setLoading(false);
    }
    };

    // Remove by product (alternate method)
    const removeByProduct = async (productId, variantId = null) => {
    try {
        setLoading(true);

        const payload = {
        product_id: productId,
        variant_id: variantId
        };

        await api.delete('/wishlist/remove-by-product', { data: payload });

        // Reload wishlist
        await loadWishlistFromAPI();
        return { success: true };
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: 'Failed to remove from wishlist' };
    } finally {
        setLoading(false);
    }
    };

  // Toggle wishlist (add if not in, remove if in)
  const toggleWishlist = async (product, variant = null) => {
    const inWishlist = isInWishlist(product.id, variant?.id);
    
    if (inWishlist) {
      // Find the item and remove it
      const item = wishlistItems.find(
        i => i.product_id === product.id && i.variant?.id === variant?.id
      );
      if (item) {
        return await removeFromWishlist(item.id);
      }
    } else {
      return await addToWishlist(product, variant);
    }
  };

    // Clear wishlist
    const clearWishlist = async () => {
    try {
        setLoading(true);

        await api.delete('/wishlist/clear');

        setWishlistItems([]);
        setWishlistCount(0);
        return { success: true };
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return { success: false, error: 'Failed to clear wishlist' };
    } finally {
        setLoading(false);
    }
    };

  // Load wishlist on mount and when auth changes
  useEffect(() => {
    loadWishlistFromAPI();
  }, []);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      loadWishlistFromAPI();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    removeByProduct,
    toggleWishlist,
    clearWishlist,
    refreshWishlist: loadWishlistFromAPI
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};