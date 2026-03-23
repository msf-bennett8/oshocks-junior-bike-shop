import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product, onImageLoad, isImageLoaded, showModal, compact = false }) => {
  const { addToCart, toggleCart, loading: cartLoading, isInCart } = useCart();
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const inWishlist = isInWishlist(product.id, null);
  const variant = product?.variants?.[0] || product?.colors?.[0] || null;
  const inCart = isInCart(product.id, variant);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTogglingWishlist(true);
    
    try {
      const wasInWishlist = inWishlist;
      const result = await toggleWishlist(product, null);
      
      if (result.success && showModal) {
        showModal('wishlist', wasInWishlist ? 'remove' : 'add', product.name, 'shop');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    try {
      const wasInCart = inCart;
      const result = await toggleCart(product, variant);
      
      if (result.success && showModal) {
        showModal('cart', wasInCart ? 'remove' : 'add', product.name, 'shop');
      }
    } catch (error) {
      console.error('Error toggling cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.quantity === 0) return;
    setCheckingOut(product.id);
    
    try {
      const result = await toggleCart(product, variant);
      if (result.success) {
        window.location.href = '/checkout';
      }
    } catch (error) {
      console.error('Error:', error);
      setCheckingOut(null);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative ${compact ? 'min-w-[200px] w-[200px]' : ''}`}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative pb-[75%] bg-gray-100 flex">
          {/* Variant Thumbnails - Hidden in compact mode */}
          {!compact && product.variants && product.variants.length > 0 && (
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5 max-h-[70%] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {product.variants.slice(0, 4).map((variant, idx) => {
                const variantImage = variant.images?.[0]?.thumbnail_url || variant.images?.[0]?.image_url;
                return (
                  <button
                    key={variant.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const card = e.currentTarget.closest('.relative');
                      const mainImg = card?.querySelector('img[data-main-image="true"]');
                      if (mainImg && variantImage) {
                        mainImg.style.opacity = '0.6';
                        mainImg.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                          mainImg.src = variant.images?.[0]?.image_url || variantImage;
                          mainImg.style.opacity = '1';
                          mainImg.style.transform = 'scale(1)';
                        }, 150);
                      }
                    }}
                    className="group relative w-10 h-10 rounded-lg border-2 border-white/80 shadow-md overflow-hidden hover:scale-115 hover:z-10 transition-all duration-200 hover:border-orange-400 bg-gray-100"
                    title={variant.name || `Variant ${idx + 1}`}
                  >
                    {variantImage ? (
                      <img
                        src={variantImage}
                        alt={variant.name || `Variant ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white uppercase"
                        style={{
                          background: `linear-gradient(135deg, ${['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 6]} 0%, ${['#b91c1c', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#be185d'][idx % 6]} 100%)`
                        }}
                      >
                        {variant.name?.charAt(0) || (idx + 1)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Main Image */}
          {product.image_url || product.images?.[0]?.image_url ? (
            <>
              {!isImageLoaded && (product.images?.[0]?.thumbnail_url || product.image_url) && (
                <img
                  src={product.images?.[0]?.thumbnail_url || product.image_url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover blur-sm"
                />
              )}
              <img
                src={product.images?.[0]?.image_url || product.image_url}
                alt={product.name}
                data-main-image="true"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={onImageLoad}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-50"><svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>';
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
          
          {/* Featured Badge */}
          {product.is_featured && (
            <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
          
          {/* Discount Badge */}
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
              </span>
              <span className="bg-orange-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
                Save KSh {(Number(product.compare_price) - Number(product.price)).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className={`p-4 relative ${compact ? 'p-3' : ''}`}>
          {/* Action Icons */}
          <div className={`absolute -top-3 -right-3 flex flex-col gap-1 bg-gray-100 rounded-lg p-1.5 border border-gray-200 shadow-md z-20 ${compact ? 'hidden' : ''}`}>
            <button
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-gray-200 disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${inWishlist ? 'text-orange-500 fill-orange-500' : 'text-gray-600'}`} 
                fill={inWishlist ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={!product.quantity || cartLoading}
              className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-gray-200 disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${inCart ? 'text-orange-500 fill-orange-500' : !product.quantity ? 'text-gray-400' : 'text-gray-600'}`} 
                fill={inCart ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>

          {/* Brand */}
          {product.brand && (
            <p className={`text-xs text-gray-500 mb-1 ${compact ? 'text-[10px]' : ''}`}>
              Brand: <span className="font-medium text-gray-700">{product.brand}</span>
            </p>
          )}

          <h3 className={`font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-green-600 transition pr-8 ${compact ? 'text-sm h-10' : 'text-sm h-12'}`}>
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex justify-between items-center mt-3">
            <div>
              <span className={`font-bold text-green-600 ${compact ? 'text-lg' : 'text-xl'}`}>
                KSh {Number(product.price).toLocaleString()}
              </span>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className={`text-gray-400 line-through ml-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                  KSh {Number(product.compare_price).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Condition and Stock Status */}
          <div className="flex items-center justify-between gap-2 mt-3">
            {product.condition && (
              <span className={`text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium whitespace-nowrap ${compact ? 'text-[10px]' : ''}`}>
                {product.condition}
              </span>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              {product.quantity && product.quantity > 0 ? (
                product.quantity <= 5 ? (
                  <span className={`text-orange-600 font-semibold flex items-center whitespace-nowrap ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                    {product.quantity} left!
                  </span>
                ) : (
                  <span className={`text-green-600 font-semibold flex items-center whitespace-nowrap ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    In Stock
                  </span>
                )
              ) : (
                <span className={`text-red-600 font-semibold flex items-center whitespace-nowrap ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  Out of Stock
                </span>
              )}
              
              {!compact && product.quantity > 0 && (
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut === product.id}
                  className={`text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded font-semibold hover:from-orange-600 hover:to-red-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                    checkingOut === product.id ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {checkingOut === product.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;