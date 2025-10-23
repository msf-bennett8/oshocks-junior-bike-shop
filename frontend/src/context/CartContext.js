//frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import authService from '../services/authService';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Load cart from localStorage or API on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromAPI();
    } else {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Load cart from localStorage (for guests)
  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
    }
  };

  // Load cart from API (for authenticated users)
const loadCartFromAPI = async () => {
    console.log('🛒 ========================================');
    console.log('🛒 LOADING CART FROM API');
    console.log('🛒 ========================================');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    
    try {
      setLoading(true);
      console.log('⏳ Setting loading to true...');
      
      const token = authService.getToken();
      console.log('🎫 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      const requestUrl = `${API_URL}/cart`;
      console.log('📡 Request URL:', requestUrl);
      console.log('📤 Request headers:', token ? { Authorization: `Bearer ${token.substring(0, 20)}...` } : 'NO AUTH HEADER');
      
      const response = await axios.get(requestUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log('✅ Response received!');
      console.log('📊 Response status:', response.status);
      console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
      console.log('📋 Items in response:', response.data.items?.length || 0);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.items)) {
        console.warn('⚠️ Unexpected cart response structure');
        setCartItems([]);
        return;
      }

      // Map backend response to frontend cart structure
      const mappedItems = response.data.items.map((item, index) => {
        console.log(`🔄 Mapping item ${index + 1}:`, {
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
        
        return {
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          price: Number(item.price),
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          image: item.image,
          thumbnail: item.thumbnail,
          quantity: item.quantity,
          stock: item.stock,
          variant: item.variant,
          seller: item.seller,
          seller_name: item.seller,
          category: item.category,
          slug: item.slug
        };
      });

      console.log('✨ Mapped items:', JSON.stringify(mappedItems, null, 2));
      console.log('🎯 Setting cart items to state...');
      setCartItems(mappedItems);
      console.log('✅ Cart items set successfully!');
      console.log('🛒 ========================================');
    } catch (err) {
      console.error('❌ ========================================');
      console.error('❌ FAILED TO LOAD CART FROM API');
      console.error('❌ ========================================');
      console.error('❌ Error object:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error response status:', err.response?.status);
      console.error('❌ Error response headers:', err.response?.headers);
      console.error('❌ ========================================');
      setError('Failed to load cart');
    } finally {
      console.log('🏁 Setting loading to false...');
      setLoading(false);
    }
  };

  // Add item to cart
const addToCart = async (product, quantity = 1, variant = null, selectedSize = null) => {
    console.log('➕ ========================================');
    console.log('➕ ADD TO CART CALLED');
    console.log('➕ ========================================');
    console.log('📦 Product:', {
      id: product?.id,
      name: product?.name,
      price: product?.price
    });
    console.log('🔢 Quantity:', quantity);
    console.log('🎨 Variant:', variant);
    console.log('📏 Selected Size:', selectedSize);
    console.log('🔐 isAuthenticated:', isAuthenticated);
    
    try {
      setLoading(true);
      setError(null);
      console.log('⏳ Loading started...');

      // Sync with backend first (or guest cart)
      if (isAuthenticated) {
        console.log('✅ User is authenticated - syncing with backend...');
        const token = authService.getToken();
        console.log('🎫 Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        
        const payload = {
          product_id: product.id,
          quantity,
          variant_id: variant?.id || null
        };
        console.log('📤 Request payload:', JSON.stringify(payload, null, 2));
        console.log('📡 Request URL:', `${API_URL}/cart/add`);
        
        const response = await axios.post(`${API_URL}/cart/add`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Add to cart response:', JSON.stringify(response.data, null, 2));
        console.log('🔄 Reloading cart from API...');
        
        // Reload cart from API to get updated data
        await loadCartFromAPI();
        console.log('✅ Cart reloaded successfully!');
      } else {
        console.log('👤 Guest user - managing cart locally...');
        // For guest users, manage locally
        const existingItemIndex = cartItems.findIndex(
          item => item.product_id === product.id && 
          item.variant?.id === variant?.id
        );
        console.log('🔍 Existing item index:', existingItemIndex);

        let updatedCart;

        if (existingItemIndex > -1) {
          console.log('📝 Updating existing item quantity...');
          updatedCart = [...cartItems];
          updatedCart[existingItemIndex].quantity += quantity;
          console.log('✅ New quantity:', updatedCart[existingItemIndex].quantity);
        } else {
          console.log('🆕 Creating new cart item...');
          const newItem = {
            id: Date.now(),
            product_id: product.id,
            name: product.name,
            price: Number(variant?.price || product.price),
            originalPrice: product.compare_price ? Number(product.compare_price) : null,
            image: product.images?.[0]?.image_url || product.images?.[0]?.thumbnail_url || product.image,
            thumbnail: product.images?.[0]?.thumbnail_url || product.images?.[0]?.image_url,
            quantity,
            variant: variant,
            seller: product.seller?.name || 'Oshocks Junior',
            seller_name: product.seller?.name || 'Oshocks Junior',
            stock: product.quantity || 0,
            category: product.category?.name || 'Bikes',
            slug: product.slug
          };
          console.log('🆕 New item created:', JSON.stringify(newItem, null, 2));
          updatedCart = [...cartItems, newItem];
        }

        console.log('💾 Saving to state...');
        setCartItems(updatedCart);
        console.log('✅ Guest cart updated!');
      }

      console.log('✅ ========================================');
      console.log('✅ ADD TO CART SUCCESSFUL');
      console.log('✅ ========================================');
      return { success: true, message: 'Item added to cart' };
    } catch (err) {
      console.error('❌ ========================================');
      console.error('❌ ADD TO CART FAILED');
      console.error('❌ ========================================');
      console.error('❌ Error:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ ========================================');
      
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      console.log('🏁 Setting loading to false...');
      setLoading(false);
    }
  };

  // Remove item from cart
const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      // Sync with backend if authenticated
      if (isAuthenticated) {
        const token = authService.getToken();
        await axios.delete(`${API_URL}/cart/items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Reload cart from API
        await loadCartFromAPI();
      } else {
        // For guest users, manage locally
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
      }

      return { success: true, message: 'Item removed from cart' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
const updateQuantity = async (itemId, newQuantity) => {
    try {
      setLoading(true);
      setError(null);

      if (newQuantity <= 0) {
        return removeFromCart(itemId);
      }

      // Sync with backend if authenticated
      if (isAuthenticated) {
        const token = authService.getToken();
        await axios.put(`${API_URL}/cart/items/${itemId}`, {
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Reload cart from API
        await loadCartFromAPI();
      } else {
        // For guest users, manage locally
        const updatedCart = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
      }

      return { success: true, message: 'Quantity updated' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      setCartItems([]);

      // Sync with backend if authenticated
      if (isAuthenticated) {
        const token = authService.getToken();
        await axios.delete(`${API_URL}/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        localStorage.removeItem('cart');
      }

      return { success: true, message: 'Cart cleared' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    const itemCount = cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    // Calculate shipping (you can customize this logic)
    const shipping = subtotal > 5000 ? 0 : 300; // Free shipping over KES 5000

    // Calculate tax (if applicable)
    const taxRate = 0; // Kenya VAT already included in prices
    const tax = subtotal * taxRate;

    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount
    };
  };

  // Check if product is in cart
  const isInCart = (productId, variant = null) => {
    return cartItems.some(
      item => item.product_id === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
  };

  // Get item quantity in cart
  const getItemQuantity = (productId, variant = null) => {
    const item = cartItems.find(
      item => item.product_id === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    return item?.quantity || 0;
  };

  // Merge guest cart with user cart after login
  const mergeGuestCart = async () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (guestCart.length > 0 && isAuthenticated) {
        const token = authService.getToken();
        await axios.post(`${API_URL}/cart/merge`, {
          items: guestCart
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Clear guest cart
        localStorage.removeItem('cart');

        // Reload cart from API
        await loadCartFromAPI();
      }
    } catch (err) {
      console.error('Failed to merge guest cart:', err);
    }
  };

  // Validate cart items (check stock availability)
  const validateCart = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      
      const response = await axios.post(`${API_URL}/cart/validate`, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          variant: item.variant
        }))
      }, {
        headers: isAuthenticated ? { Authorization: `Bearer ${token}` } : {}
      });

      return {
        success: true,
        valid: response.data.valid,
        issues: response.data.issues || []
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to validate cart'
      };
    } finally {
      setLoading(false);
    }
  };

  // Apply coupon code
  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/cart/apply-coupon`, {
        code: couponCode,
        cart_total: getCartTotals().subtotal
      }, {
        headers: isAuthenticated ? { Authorization: `Bearer ${token}` } : {}
      });

      return {
        success: true,
        discount: response.data.discount,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid coupon code';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    isInCart,
    getItemQuantity,
    mergeGuestCart,
    validateCart,
    applyCoupon,
    loadCartFromAPI
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};