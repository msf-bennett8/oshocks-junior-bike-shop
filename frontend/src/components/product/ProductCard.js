import React, { useState } from 'react';

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

const ProductCard = ({
  id,
  name,
  slug,
  images = [],
  price,
  originalPrice,
  discount,
  rating = 0,
  reviewCount = 0,
  stock = 0,
  category,
  brand,
  isNew = false,
  isFeatured = false,
  tags = [],
  variants = [],
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  inWishlist = false,
  inCart = false,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Calculate discount percentage
  const discountPercent = discount || (originalPrice && price) 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  // Check if product is out of stock
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  // Format price for Kenyan market
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle image navigation
  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && onAddToCart) {
      onAddToCart({ id, name, price, image: images[0] });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist({ id, name, price, image: images[0] });
    }
  };

  // Handle quick view
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(id);
    }
  };

  // Get current image or fallback
  const currentImage = images[currentImageIndex] || '/placeholder-bike.jpg';

  return (
    <div 
      className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 relative ${className}`}
      onMouseEnter={() => setShowQuickAdd(true)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Product Image */}
        <a href={`/product/${slug || id}`} className="block w-full h-full">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          ) : (
            <>
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={currentImage}
                alt={name}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsImageLoading(false);
                }}
              />
            </>
          )}
        </a>

        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isNew && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              NEW
            </span>
          )}
          {isFeatured && (
            <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              FEATURED
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              OUT OF STOCK
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              ONLY {stock} LEFT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md z-10 ${
            inWishlist 
              ? 'bg-red-600 text-white' 
              : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-600'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg 
            className="w-5 h-5" 
            fill={inWishlist ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={handleQuickView}
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
          >
            Quick View
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          {category && <span className="hover:text-blue-600 cursor-pointer">{category}</span>}
          {category && brand && <span>•</span>}
          {brand && <span className="hover:text-blue-600 cursor-pointer font-medium">{brand}</span>}
        </div>

        {/* Product Name */}
        <a 
          href={`/product/${slug || id}`}
          className="block mb-2"
        >
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors leading-snug min-h-[2.5rem]">
            {name}
          </h3>
        </a>

        {/* Rating & Reviews */}
        {rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Variants Preview */}
        {variants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1.5">Available in {variants.length} variants</p>
            <div className="flex gap-1.5">
              {variants.slice(0, 5).map((variant, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded border-2 border-gray-200 hover:border-blue-600 cursor-pointer transition-colors"
                  style={{ backgroundColor: variant.color || '#e5e7eb' }}
                  title={variant.name}
                />
              ))}
              {variants.length > 5 && (
                <div className="w-6 h-6 rounded border-2 border-gray-200 flex items-center justify-center text-xs text-gray-600 bg-gray-50">
                  +{variants.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {isOutOfStock ? (
            <p className="text-xs text-red-600 font-medium">Out of stock</p>
          ) : isLowStock ? (
            <p className="text-xs text-orange-600 font-medium">Only {stock} units left!</p>
          ) : (
            <p className="text-xs text-green-600 font-medium">In stock</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : inCart
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : inCart ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                In Cart
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>

      {/* Quick Add Overlay (Mobile/Touch) */}
      {showQuickAdd && !isOutOfStock && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity md:hidden">
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Quick Add
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PRODUCT GRID DEMO
// ============================================================================

const ProductGridDemo = () => {
  const [wishlist, setWishlist] = useState(new Set());
  const [cart, setCart] = useState(new Set());

  // Sample products for Oshocks Junior Bike Shop
  const sampleProducts = [
    {
      id: 1,
      name: 'Mountain Bike Pro X1 - 27.5" Aluminum Frame with Shimano Gears',
      slug: 'mountain-bike-pro-x1',
      images: [
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500',
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500'
      ],
      price: 45000,
      originalPrice: 55000,
      rating: 4.5,
      reviewCount: 128,
      stock: 12,
      category: 'Mountain Bikes',
      brand: 'Trek',
      isNew: true,
      tags: ['21-Speed', 'Disc Brakes', 'Suspension'],
      variants: [
        { name: 'Red', color: '#DC2626' },
        { name: 'Blue', color: '#2563EB' },
        { name: 'Black', color: '#1F2937' }
      ]
    },
    {
      id: 2,
      name: 'City Cruiser Comfort Bike - Perfect for Urban Commuting',
      slug: 'city-cruiser-comfort',
      images: [
        'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500'
      ],
      price: 28000,
      originalPrice: 32000,
      rating: 4.8,
      reviewCount: 89,
      stock: 3,
      category: 'City Bikes',
      brand: 'Giant',
      isFeatured: true,
      tags: ['Comfort', '7-Speed', 'Basket Included']
    },
    {
      id: 3,
      name: 'Kids BMX Freestyle Bike - Ages 8-12 with Training Wheels',
      slug: 'kids-bmx-freestyle',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
      ],
      price: 18500,
      rating: 4.6,
      reviewCount: 56,
      stock: 8,
      category: 'Kids Bikes',
      brand: 'Mongoose',
      isNew: true,
      tags: ['Safety Certified', 'Adjustable Seat']
    },
    {
      id: 4,
      name: 'Professional Road Bike Carbon Fiber - Racing Edition',
      slug: 'pro-road-bike-carbon',
      images: [
        'https://images.unsplash.com/photo-1511994477422-b69e44bd4ea9?w=500'
      ],
      price: 95000,
      originalPrice: 120000,
      discount: 21,
      rating: 4.9,
      reviewCount: 203,
      stock: 0,
      category: 'Road Bikes',
      brand: 'Specialized',
      isFeatured: true,
      tags: ['Carbon Frame', 'Shimano 105', 'Aerodynamic']
    },
    {
      id: 5,
      name: 'Electric Mountain Bike 750W with Long Range Battery',
      slug: 'electric-mountain-bike-750w',
      images: [
        'https://images.unsplash.com/photo-1633979592299-e5a0036c8c8c?w=500'
      ],
      price: 125000,
      rating: 4.7,
      reviewCount: 45,
      stock: 15,
      category: 'Electric Bikes',
      brand: 'Rad Power',
      isNew: true,
      isFeatured: true,
      tags: ['E-Bike', '750W Motor', '80km Range'],
      variants: [
        { name: 'Matte Black', color: '#1F2937' },
        { name: 'Gray', color: '#6B7280' }
      ]
    },
    {
      id: 6,
      name: 'Folding Bike Compact - Perfect for Small Spaces & Travel',
      slug: 'folding-bike-compact',
      images: [
        'https://images.unsplash.com/photo-1619868280561-0dd274f71358?w=500'
      ],
      price: 22000,
      originalPrice: 26000,
      rating: 4.4,
      reviewCount: 67,
      stock: 20,
      category: 'Folding Bikes',
      brand: 'Dahon',
      tags: ['Lightweight', '16-inch Wheels', 'Easy Storage']
    }
  ];

  const handleAddToCart = (product) => {
    setCart(prev => new Set(prev).add(product.id));
    console.log('Added to cart:', product);
  };

  const handleAddToWishlist = (product) => {
    setWishlist(prev => {
      const updated = new Set(prev);
      if (updated.has(product.id)) {
        updated.delete(product.id);
      } else {
        updated.add(product.id);
      }
      return updated;
    });
    console.log('Wishlist toggled:', product);
  };

  const handleQuickView = (productId) => {
    console.log('Quick view for product:', productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Oshocks Junior Bike Shop
          </h1>
          <p className="text-gray-600">
            Kenya's Premier Cycling Marketplace - Premium Bikes & Accessories
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">{cart.size} in Cart</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-900">{wishlist.size} in Wishlist</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Free Delivery on Orders KES 10,000+</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onQuickView={handleQuickView}
              inWishlist={wishlist.has(product.id)}
              inCart={cart.has(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGridDemo;
