import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// ============================================================================
// PRODUCT DETAIL COMPONENT
// ============================================================================

  // Sample reviews
  const sampleReviews = [
    {
      id: 1,
      user: 'John M.',
      rating: 5,
      date: '2024-09-15',
      verified: true,
      title: 'Excellent bike for the price!',
      comment: 'I\'ve been using this bike for mountain trails around Nairobi and it performs excellently. The gears shift smoothly and the suspension handles rough terrain well. Highly recommend!',
      helpful: 45
    },
    {
      id: 2,
      user: 'Sarah K.',
      rating: 4,
      date: '2024-09-10',
      verified: true,
      title: 'Great value, minor assembly needed',
      comment: 'The bike arrived well-packaged and mostly assembled. Quality is solid and it rides smoothly. Only reason for 4 stars is the seat could be more comfortable for long rides.',
      helpful: 32
    },
    {
      id: 3,
      user: 'David O.',
      rating: 5,
      date: '2024-09-05',
      verified: true,
      title: 'Perfect for Kenyan terrain',
      comment: 'Been riding this for 2 months now on various trails. The disc brakes are responsive and the frame feels sturdy. Worth every shilling!',
      helpful: 28
    }
  ];
  
const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const [loadedMainImage, setLoadedMainImage] = useState(false);
  const [loadedThumbnails, setLoadedThumbnails] = useState(new Set());

  const handleMainImageLoad = () => {
    setLoadedMainImage(true);
  };

  const handleThumbnailLoad = (index) => {
    setLoadedThumbnails(prev => new Set([...prev, index]));
  };


  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        
        console.log('🔍 Fetching product...');
        console.log('📍 API URL:', apiUrl);
        console.log('🆔 Product ID:', id);
        console.log('🌐 Full URL:', `${apiUrl}/products/${id}`);
        
        const response = await fetch(`${apiUrl}/products/${id}`);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response not OK. Status:', response.status);
          console.error('❌ Error body:', errorText);
          throw new Error(`Product not found (${response.status})`);
        }
        
        const data = await response.json();
        console.log('✅ Product data received:', data);
        console.log('🖼️ Images:', data.images);
        console.log('🎨 Variants:', data.variants);
        console.log('🏷️ Brand:', data.brand);
        
        setProduct(data);
        
        // Set default selections
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0].id);
        }
        if (data.specifications?.sizes && data.specifications.sizes.length > 0) {
          setSelectedSize(data.specifications.sizes[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('💥 Error fetching product:', err);
        console.error('💥 Error message:', err.message);
        console.error('💥 Error stack:', err.stack);
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      try {
        setLoadingRelated(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        
        // Fetch products from same category, excluding current product
        const categoryParam = product.category?.id ? `?category=${product.category.id}` : '';
        const response = await fetch(`${apiUrl}/products${categoryParam}`);
        
        if (response.ok) {
          const data = await response.json();
          // Filter out current product and limit to 4 products
          const related = (data.data || data)
            .filter(p => p.id !== product.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
        
        setLoadingRelated(false);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Set reviews (can be from product.reviews later)
  useEffect(() => {
    if (product?.reviews) {
      setReviews(product.reviews);
    } else {
      setReviews(sampleReviews);
    }
  }, [product]);

  // Reset loaded state when selected image changes
  useEffect(() => {
    setLoadedMainImage(false);
  }, [selectedImage]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <a href="/shop" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert('Please select a color');
      return;
    }
    if (product.specifications?.sizes && product.specifications.sizes.length > 0 && !selectedSize) {
      alert('Please select a frame size');
      return;
    }
    console.log('Adding to cart:', { product: product.id, variant: selectedVariant, size: selectedSize, quantity });
    alert('Added to cart successfully!');
  };

  const handleBuyNow = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert('Please select a color');
      return;
    }
    if (product.specifications?.sizes && product.specifications.sizes.length > 0 && !selectedSize) {
      alert('Please select a frame size');
      return;
    }
    alert('Proceeding to checkout...');
  };

  const calculateTotal = () => Number(product?.price || 0) * quantity;
  const discountAmount = product?.compare_price ? Number(product.compare_price) - Number(product.price) : 0;
  const savingsTotal = discountAmount * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">Home</a>
            <span>›</span>
            <a href="/shop" className="hover:text-blue-600">Shop</a>
            <span>›</span>
            {product.category && (
              <>
                <a href={`/shop?category=${product.category.id}`} className="hover:text-blue-600">{product.category.name}</a>
                <span>›</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden aspect-square">
              {/* Thumbnail - loads first, blurred */}
              {!loadedMainImage && product.images?.[selectedImage]?.thumbnail_url && (
                <img 
                  src={product.images[selectedImage].thumbnail_url} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover blur-sm" 
                />
              )}
              {/* Full resolution - loads after, crisp */}
              <img 
                src={product.images?.[selectedImage]?.image_url || product.images?.[selectedImage]?.thumbnail_url || 'https://via.placeholder.com/800?text=No+Image'} 
                alt={product.name} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  loadedMainImage ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleMainImageLoad}
              />
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new_arrival && <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-md">NEW</span>}
                {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md">
                  -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                </span>
              )}
              </div>

              <button onClick={() => setIsWishlisted(!isWishlisted)} className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isWishlisted ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:text-red-600'}`}>
                <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">{selectedImage + 1} / {product.images.length}</div>
            </div>

            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)} className={`relative aspect-square rounded-lg overflow-hidden transition-all ${selectedImage === index ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:opacity-75'}`}>
                    {/* Thumbnail placeholder - shows while loading */}
                    {!loadedThumbnails.has(index) && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    )}
                    {/* Actual thumbnail */}
                    <img 
                      src={image.thumbnail_url || image.image_url || 'https://via.placeholder.com/150?text=No+Image'} 
                      alt={`View ${index + 1}`} 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        loadedThumbnails.has(index) ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleThumbnailLoad(index)}
                    />
                  </button>
                ))
              ) : (
                <div className="col-span-4 text-center text-gray-400 py-4">No images available</div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
              {product.brand && (
                <>
                  <a href={`/brand/${product.brand?.toLowerCase()}`} className="text-blue-600 hover:underline font-semibold">{product.brand}</a>
                  <span className="text-gray-400">|</span>
                </>
              )}
              {product.condition && (
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full capitalize">
                {product.condition.replace(/-/g, ' ')}
              </div>
            )}
              <span className="text-gray-600">{product.category?.name || 'Uncategorized'}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">{Number(product.rating || 0).toFixed(1)}</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <button onClick={() => setActiveTab('reviews')} className="text-blue-600 hover:underline font-medium">{product.reviews_count || 0} Reviews</button>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-gray-600">{product.sales || 0} Sold</span>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-100">
              <div className="flex flex-wrap items-baseline gap-2 md:gap-3 mb-2">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                  <span className="text-lg md:text-xl text-gray-500 line-through">{formatPrice(product.compare_price)}</span>
                )}
              </div>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <p className="text-green-600 font-semibold">
                  You save {formatPrice(Number(product.compare_price) - Number(product.price))} ({Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% off)
                </p>
              )}
            </div>

           <div className="flex items-center gap-3">
              {product.quantity > 0 ? (
                <>
                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    In Stock
                  </span>
                  {product.quantity <= 10 && <span className="text-orange-600 font-medium">Only {product.quantity} units left!</span>}
                </>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">
                  Select Color: {selectedVariant && <span className="text-blue-600">{product.variants.find(v => v.id === selectedVariant)?.name}</span>}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                    const attributes = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
                    const colorCode = attributes?.color || '#gray';
                    
                    return (
                  <button key={variant.id} onClick={() => variant.quantity > 0 && setSelectedVariant(variant.id)} disabled={variant.quantity === 0} className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 transition-all ${selectedVariant === variant.id ? 'border-blue-600 ring-2 ring-blue-200' : variant.quantity === 0 ? 'border-gray-300 opacity-40 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400'}`} style={{ backgroundColor: colorCode }}>
                      {variant.quantity === 0 && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-gray-400 rotate-45"></div></div>}
                    {selectedVariant === variant.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
                  })}
                </div>
              </div>
            )}

            {product.specifications?.sizes && product.specifications.sizes.length > 0 && (
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">
                  Select Frame Size: {selectedSize && <span className="text-blue-600">{product.specifications.sizes.find(s => s.id === selectedSize)?.name}</span>}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {product.specifications.sizes.map((size) => (
                  <button key={size.id} onClick={() => size.available && setSelectedSize(size.id)} disabled={!size.available} className={`py-2 px-3 md:py-3 md:px-4 rounded-lg border-2 transition-all text-center ${selectedSize === size.id ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold' : size.available ? 'border-gray-300 hover:border-gray-400 text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
                    <div className="font-semibold">{size.value}</div>
                    <div className="text-xs mt-1">{size.recommended}</div>
                  </button>
                ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="px-3 md:px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input type="number" value={quantity} onChange={(e) => { const val = parseInt(e.target.value); if (val >= 1 && val <= product.quantity) setQuantity(val); }} className="w-12 md:w-16 text-center font-semibold border-none focus:outline-none text-sm md:text-base" min="1" max={product.quantity} />
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.quantity} className="px-3 md:px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm md:text-base text-gray-600">{product.quantity} available</span>
              </div>
            </div>

            {quantity > 1 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Subtotal ({quantity} items):</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(calculateTotal())}</span>
                </div>
                {savingsTotal > 0 && (
                  <div className="flex justify-between items-center mt-2 text-green-600">
                    <span className="text-sm">Total Savings:</span>
                    <span className="font-semibold">{formatPrice(savingsTotal)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} disabled={product.quantity === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={product.quantity === 0} className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all active:scale-95 text-sm md:text-base">Buy Now</button>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Free Delivery Available</p>
                  <p className="text-sm text-gray-700">
                    {calculateTotal() >= 10000 ? (
                      <span className="text-green-600 font-semibold">✓ You qualify for FREE delivery!</span>
                    ) : (
                      <>Add {formatPrice(10000 - calculateTotal())} more to qualify</>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Estimated: 2-5 business days</p>
                </div>
              </div>
            </div>

            {product.seller && (
              <div className="border-t pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {product.seller.name?.[0] || 'O'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{product.seller.name || 'Oshocks Junior Bike Shop'}</span>
                        {product.seller.verified && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {product.seller.rating || '4.8'}
                      </span>
                      <span>•</span>
                      <span>Response: {product.seller.response_time || '< 2 hours'}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Chat with Seller
                </button>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b overflow-x-auto">
            <div className="flex gap-4 md:gap-8 px-4 md:px-6 min-w-max">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 md:py-4 text-xs md:text-sm font-semibold border-b-2 transition-colors capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  {tab === 'reviews' && ` (${product.reviewCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Product Description</h2>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {product.specifications?.key_features && product.specifications.key_features.length > 0 && (
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.specifications.key_features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature.text || feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    What's in the Box
                  </h4>
                  {product.warranty_period && (
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Warranty
                    </h4>
                    <p className="text-gray-700">This product comes with {product.warranty_period} warranty</p>
                  </div>
                )}

                  <ul className="space-y-2 text-gray-700">
                    <li>• 1x Mountain Bike Pro X1 (95% pre-assembled)</li>
                    <li>• 1x User Manual & Assembly Guide</li>
                    <li>• 1x Tool Kit for final assembly</li>
                    <li>• 1x Water Bottle Holder</li>
                    <li>• 1x Kickstand</li>
                    <li>• Warranty Card</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {Object.entries(product.specifications)
                      .filter(([key]) => !['key_features', 'sizes'].includes(key)) // Exclude key_features and sizes
                      .map(([key, value], index) => (
                        <div key={index} className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}>
                          <dt className="text-sm font-semibold text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</dt>
                          <dd className="text-base font-medium text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'}
                          </dd>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No specifications available</p>
                )}

                <div className="mt-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Important Notes
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Bike arrives 95% assembled - basic tools included for final assembly</li>
                    <li>• Please check tire pressure before first ride</li>
                    <li>• Recommended to have brakes adjusted by professional after 50km</li>
                    <li>• Regular maintenance recommended every 6 months</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-gray-900">{Number(product.rating || 0).toFixed(1)}</span>
                        <div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-5 h-5 ${star <= Math.floor(Number(product.rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Based on {product.reviews_count || 0} reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm md:text-base">
                    Write a Review
                  </button>
                </div>

                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{review.user}</span>
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful ({review.helpful})
                        </button>
                        <button className="text-gray-600 hover:text-blue-600 transition-colors">
                          Report
                        </button>
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg mb-2">No reviews yet</p>
                      <p className="text-gray-400 text-sm">Be the first to review this product!</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 text-center">
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Load More Reviews
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">You May Also Like</h2>
          
          {loadingRelated ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <a 
                  key={relatedProduct.id} 
                  href={`/product/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {relatedProduct.images?.[0]?.thumbnail_url || relatedProduct.images?.[0]?.image_url ? (
                      <img 
                        src={relatedProduct.images[0].thumbnail_url || relatedProduct.images[0].image_url} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">
                        🚴
                      </div>
                    )}
                    
                    {relatedProduct.compare_price && Number(relatedProduct.compare_price) > Number(relatedProduct.price) && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round((1 - Number(relatedProduct.price) / Number(relatedProduct.compare_price)) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-xs md:text-sm text-gray-900 mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm md:text-base lg:text-lg font-bold text-purple-600">
                        KES {Number(relatedProduct.price).toLocaleString()}
                      </p>
                      {relatedProduct.compare_price && Number(relatedProduct.compare_price) > Number(relatedProduct.price) && (
                        <p className="text-xs text-gray-400 line-through">
                          KES {Number(relatedProduct.compare_price).toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    {relatedProduct.quantity !== undefined && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          relatedProduct.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {relatedProduct.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg font-medium">No other products available</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for more items!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;