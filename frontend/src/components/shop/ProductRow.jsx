import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductRow = ({ 
  title, 
  products, 
  viewAllLink, 
  viewAllParams = {},
  loading = false,
  showModal,
  loadedImages,
  onImageLoad,
  icon: Icon
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -container.clientWidth * 0.8 : container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const handleScroll = () => {
    checkScrollability();
  };

  // Build query string for view all
  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(viewAllParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return queryString ? `${viewAllLink}?${queryString}` : viewAllLink;
  };

  if (!loading && products.length === 0) return null;

  return (
    <div className="mb-8 md:mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-orange-600" />}
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        
        {viewAllLink && (
          <Link 
            to={buildQueryString()}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm md:text-base transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Products Container */}
      <div className="relative group">
        {/* Left Arrow - Desktop */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hidden md:flex ${
            canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
          } hover:bg-orange-50 hover:shadow-xl`}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Right Arrow - Desktop */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hidden md:flex ${
            canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          } hover:bg-orange-50 hover:shadow-xl`}
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 md:px-0 md:mx-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {loading ? (
            // Loading Skeletons
            [...Array(5)].map((_, index) => (
              <div 
                key={index}
                className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse mt-2"></div>
                </div>
              </div>
            ))
          ) : (
            // Product Cards
            products.map((product) => (
              <div 
                key={product.id} 
                className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] flex-shrink-0"
              >
                <ProductCard
                  product={product}
                  onImageLoad={() => onImageLoad && onImageLoad(product.id)}
                  isImageLoaded={loadedImages && loadedImages.has(product.id)}
                  showModal={showModal}
                  compact={true}
                />
              </div>
            ))
          )}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center gap-1 mt-2 md:hidden">
          {products.length > 0 && !loading && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>Swipe</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRow;