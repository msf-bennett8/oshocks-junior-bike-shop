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
    return wishlistItems.some(item => {
      // Match product ID
      const productMatch = item.product_id === productId;
      
      // Match variant - handle null/undefined cases properly
      // If variantId is null/undefined, item.variant should also be null/undefined or have null id
      const itemVariantId = item.variant?.id || null;
      const searchVariantId = variantId || null;
      const variantMatch = itemVariantId === searchVariantId;
      
      return productMatch && variantMatch;
    });
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

        // Log wishlist add event
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
          logFrontendAuditEvent(AUDIT_EVENTS.WISHLIST_ITEM_ADDED, {
            category: 'wishlist',
            severity: 'low',
            metadata: {
              product_id: product.id,
              product_name: product.name,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (e) {
          // Silently fail
        }

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

        // Log wishlist remove event
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
          logFrontendAuditEvent(AUDIT_EVENTS.WISHLIST_ITEM_REMOVED, {
            category: 'wishlist',
            severity: 'low',
            metadata: {
              item_id: itemId,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (e) {
          // Silently fail
        }

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

  // Merge guest wishlist with user wishlist after login
  const mergeGuestWishlist = async () => {
    try {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      
      if (guestWishlist.length === 0) return;

      setLoading(true);
      
      // Add each guest item to server wishlist
      for (const item of guestWishlist) {
        try {
          await api.post('/wishlist/add', {
            product_id: item.product_id,
            variant_id: item.variant_id || null
          });
        } catch (error) {
          // Item might already exist, continue
          console.log('Wishlist merge item skipped:', error.message);
        }
      }

      // Clear guest wishlist
      localStorage.removeItem('guestWishlist');
      
      // Reload from server
      await loadWishlistFromAPI();
      
    } catch (error) {
      console.error('Error merging guest wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save to guest wishlist (for non-authenticated users)
  const saveToGuestWishlist = (product, variant = null) => {
    const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
    
    // Check if already exists
    const exists = guestWishlist.some(
      item => item.product_id === product.id && item.variant_id === (variant?.id || null)
    );
    
    if (!exists) {
      guestWishlist.push({
        product_id: product.id,
        variant_id: variant?.id || null,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.image_url || product.image_url,
        added_at: new Date().toISOString()
      });
      
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
    }
  };

  // Modified addToWishlist that handles guest users
  const addToWishlistWithGuest = async (product, variant = null) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // Guest user - save to localStorage
      saveToGuestWishlist(product, variant);
      return { success: true, message: 'Saved to wishlist (guest mode)' };
    }
    
    // Authenticated user - use API
    return await addToWishlist(product, variant);
  };

  // Load wishlist on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadWishlistFromAPI();
    } else {
      // Load from guest wishlist
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      setWishlistItems(guestWishlist.map(item => ({
        product_id: item.product_id,
        variant: item.variant_id ? { id: item.variant_id } : null,
        product: {
          name: item.name,
          price: item.price,
          images: [{ image_url: item.image }]
        }
      })));
      setWishlistCount(guestWishlist.length);
    }
  }, []);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      loadWishlistFromAPI();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Updated toggleWishlist that handles guest users
  const toggleWishlistWithGuest = async (product, variant = null) => {
    const inWishlist = isInWishlist(product.id, variant?.id || null);
    
    if (inWishlist) {
      // Find the item and remove it
      const item = wishlistItems.find(
        i => i.product_id === product.id && (i.variant?.id || null) === (variant?.id || null)
      );
      if (item) {
        if (localStorage.getItem('authToken')) {
          return await removeFromWishlist(item.id);
        } else {
          // Guest removal
          const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
          const updated = guestWishlist.filter(
            w => !(w.product_id === product.id && w.variant_id === (variant?.id || null))
          );
          localStorage.setItem('guestWishlist', JSON.stringify(updated));
          // Update state
          setWishlistItems(wishlistItems.filter(
            i => !(i.product_id === product.id && (i.variant?.id || null) === (variant?.id || null))
          ));
          setWishlistCount(prev => Math.max(0, prev - 1));
          return { success: true, message: 'Removed from wishlist' };
        }
      }
    } else {
      // Add to wishlist (guest-aware)
      return await addToWishlistWithGuest(product, variant);
    }
  };

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    isInWishlist,
    addToWishlist,
    addToWishlistWithGuest,
    removeFromWishlist,
    removeByProduct,
    toggleWishlist: toggleWishlistWithGuest, // Use the guest-aware version
    clearWishlist,
    mergeGuestWishlist,
    refreshWishlist: loadWishlistFromAPI
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};