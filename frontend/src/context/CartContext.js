//frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, getToken } = useAuth();

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
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Failed to load cart from API:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1, variant = null) => {
    try {
      setLoading(true);
      setError(null);

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        item => item.product_id === product.id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      let updatedCart;

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem = {
          id: Date.now(), // Temporary ID for local state
          product_id: product.id,
          name: product.name,
          price: variant?.price || product.price,
          image: product.images?.[0] || product.image,
          quantity,
          variant,
          seller_id: product.seller_id,
          seller_name: product.seller_name,
          stock: product.stock || variant?.stock
        };
        updatedCart = [...cartItems, newItem];
      }

      setCartItems(updatedCart);

      // Sync with backend if authenticated
      if (isAuthenticated) {
        const token = getToken();
        await axios.post(`${API_URL}/cart/add`, {
          product_id: product.id,
          quantity,
          variant
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      return { success: true, message: 'Item added to cart' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      const updatedCart = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedCart);

      // Sync with backend if authenticated
      if (isAuthenticated) {
        const token = getToken();
        await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

      const updatedCart = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedCart);

      // Sync with backend if authenticated
      if (isAuthenticated) {
        const token = getToken();
        await axios.put(`${API_URL}/cart/update/${itemId}`, {
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        const token = getToken();
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
        const token = getToken();
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
      const token = getToken();
      
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

      const token = getToken();
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