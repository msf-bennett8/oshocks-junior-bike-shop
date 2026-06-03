import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle, Camera, X, Filter, ChevronDown, Search, TrendingUp, Award, Users, MessageSquare, Image as ImageIcon, Upload } from 'lucide-react';

const ReviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: '',
    images: [],
    wouldRecommend: true,
    verified: true
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProduct({
        id: 1,
        name: 'Mountain Bike - Trek Marlin 7 29" Aluminum Frame',
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        price: 35000,
        sku: 'MTB-TRK-ML7-BLK',
        averageRating: 4.5,
        totalReviews: 127,
        ratingDistribution: {
          5: 78,
          4: 32,
          3: 10,
          2: 4,
          1: 3
        }
      });

      setReviews([
        {
          id: 1,
          userId: 'user123',
          userName: 'Peter Mwangi',
          userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          rating: 5,
          title: 'Excellent bike for mountain trails!',
          comment: 'I have been using this bike for 3 months now and it has exceeded all my expectations. The frame is sturdy, gears shift smoothly, and it handles rough terrain like a champ. Highly recommended for serious mountain bikers.',
          pros: 'Durable frame, smooth gear shifting, excellent suspension',
          cons: 'A bit heavy for uphill climbs',
          images: [
            'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=300',
            'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=300'
          ],
          wouldRecommend: true,
          verified: true,
          date: '2024-09-15T10:30:00',
          helpful: 45,
          notHelpful: 2,
          userVote: null
        },
        {
          id: 2,
          userId: 'user456',
          userName: 'Sarah Wanjiku',
          userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
          rating: 4,
          title: 'Great value for money',
          comment: 'This bike is perfect for weekend rides. The quality is impressive for the price point. Assembly was straightforward and the bike feels solid. Only minor issue is the seat could be more comfortable for long rides.',
          pros: 'Affordable, good quality, easy assembly',
          cons: 'Seat comfort could be better',
          images: [],
          wouldRecommend: true,
          verified: true,
          date: '2024-09-20T14:20:00',
          helpful: 32,
          notHelpful: 1,
          userVote: null
        },
        {
          id: 3,
          userId: 'user789',
          userName: 'James Ochieng',
          userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
          rating: 5,
          title: 'Best purchase I made this year!',
          comment: 'After months of research, I finally decided on this bike and I am so glad I did. Perfect for the Karura Forest trails. The bike arrived well-packaged and Oshocks customer service was excellent throughout.',
          pros: 'Perfect for local trails, great customer service, fast delivery',
          cons: 'None so far',
          images: [
            'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300'
          ],
          wouldRecommend: true,
          verified: true,
          date: '2024-10-01T09:15:00',
          helpful: 28,
          notHelpful: 0,
          userVote: null
        },
        {
          id: 4,
          userId: 'user321',
          userName: 'Mary Akinyi',
          userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          rating: 4,
          title: 'Good bike, needs minor adjustments',
          comment: 'Overall satisfied with the purchase. The bike performs well on most terrains. Had to adjust the brakes after the first few rides but after that, everything has been smooth. Good quality materials.',
          pros: 'Good build quality, versatile',
          cons: 'Brakes needed adjustment initially',
          images: [],
          wouldRecommend: true,
          verified: true,
          date: '2024-10-05T16:45:00',
          helpful: 15,
          notHelpful: 3,
          userVote: null
        },
        {
          id: 5,
          userId: 'user654',
          userName: 'David Kamau',
          userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          rating: 3,
          title: 'Decent bike but had some issues',
          comment: 'The bike is okay but I expected better quality for the price. Some components feel a bit cheap. Customer service was helpful in resolving my concerns though.',
          pros: 'Responsive customer service',
          cons: 'Some components feel cheap, assembly was tricky',
          images: [],
          wouldRecommend: false,
          verified: true,
          date: '2024-10-08T11:20:00',
          helpful: 8,
          notHelpful: 12,
          userVote: null
        }
      ]);

      // Check if user has already reviewed
      setUserReview(null); // Set to null to allow new review, or set existing review
      setLoading(false);
    }, 800);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 5) {
      showNotification('Maximum 5 images allowed', 'error');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      showNotification('Please select a rating', 'error');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const newReview = {
        id: Date.now(),
        userId: 'currentUser',
        userName: 'John Kamau',
        userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        pros: reviewForm.pros,
        cons: reviewForm.cons,
        images: uploadedImages,
        wouldRecommend: reviewForm.wouldRecommend,
        verified: true,
        date: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        userVote: null
      };

      setReviews([newReview, ...reviews]);
      setUserReview(newReview);
      setShowReviewForm(false);
      setReviewForm({
        rating: 0,
        title: '',
        comment: '',
        pros: '',
        cons: '',
        images: [],
        wouldRecommend: true,
        verified: true
      });
      setUploadedImages([]);
      showNotification('Review submitted successfully! Thank you for your feedback.');
    }, 1000);
  };

  const handleVoteHelpful = (reviewId, voteType) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        if (review.userVote === voteType) {
          // Remove vote
          return {
            ...review,
            helpful: voteType === 'helpful' ? review.helpful - 1 : review.helpful,
            notHelpful: voteType === 'notHelpful' ? review.notHelpful - 1 : review.notHelpful,
            userVote: null
          };
        } else if (review.userVote) {
          // Change vote
          return {
            ...review,
            helpful: voteType === 'helpful' ? review.helpful + 1 : review.helpful - 1,
            notHelpful: voteType === 'notHelpful' ? review.notHelpful + 1 : review.notHelpful - 1,
            userVote: voteType
          };
        } else {
          // New vote
          return {
            ...review,
            helpful: voteType === 'helpful' ? review.helpful + 1 : review.helpful,
            notHelpful: voteType === 'notHelpful' ? review.notHelpful + 1 : review.notHelpful,
            userVote: voteType
          };
        }
      }
      return review;
    }));
  };

  const filterAndSortReviews = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating, size = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = filterAndSortReviews();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronDown className="w-5 h-5 rotate-90 mr-2" />
            Back to Product
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h1>
          <p className="text-gray-600">Share your experience and read what others have to say</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</p>
            </div>

            {/* Overall Rating */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Rating</h3>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {product.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(product.averageRating), 'lg')}
                <p className="text-sm text-gray-600 mt-2">Based on {product.totalReviews} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = product.ratingDistribution[rating];
                  const percentage = (count / product.totalReviews) * 100;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-8">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Review Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Verified Purchases</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {Math.round((reviews.filter(r => r.verified).length / reviews.length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Would Recommend</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round((reviews.filter(r => r.wouldRecommend).length / reviews.length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <ImageIcon className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">With Photos</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    {reviews.filter(r => r.images.length > 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Write Review Button */}
            {!userReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors flex items-center justify-center"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Write a Review
              </button>
            )}
          </div>

          {/* Right Column - Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters & Search */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Extended Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Rating</label>
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-600">Try adjusting your filters or be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.userImage}
                          alt={review.userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{review.userName}</h4>
                            {review.verified && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                          {renderStars(review.rating, 'sm')}
                          <p className="text-xs text-gray-500 mt-1">{formatDate(review.date)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{review.title}</h3>

                    {/* Review Comment */}
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                    {/* Pros & Cons */}
                    {(review.pros || review.cons) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-bold text-green-900 mb-2">👍 Pros</p>
                            <p className="text-sm text-green-800">{review.pros}</p>
                          </div>
                        )}
                        {review.cons && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-bold text-red-900 mb-2">👎 Cons</p>
                            <p className="text-sm text-red-800">{review.cons}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Review Images */}
                    {review.images.length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Review ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    {/* Recommendation */}
                    {review.wouldRecommend && (
                      <div className="flex items-center text-sm text-green-600 font-medium mb-4">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Would recommend this product
                      </div>
                    )}

                    {/* Helpful Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Was this review helpful?</span>
                      <button
                        onClick={() => handleVoteHelpful(review.id, 'helpful')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                          review.userVote === 'helpful'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Yes ({review.helpful})</span>
                      </button>
                      <button
                        onClick={() => handleVoteHelpful(review.id, 'notHelpful')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                          review.userVote === 'notHelpful'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm font-medium">No ({review.notHelpful})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h4 className="font-bold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || reviewForm.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {reviewForm.rating > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {reviewForm.rating === 5 ? 'Excellent' : 
                       reviewForm.rating === 4 ? 'Good' :
                       reviewForm.rating === 3 ? 'Average' :
                       reviewForm.rating === 2 ? 'Poor' : 'Terrible'}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title *
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Sum up your experience in a few words"
                  required
                />
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Share your thoughts about the product. What did you like or dislike? How did you use it?"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 50 characters ({reviewForm.comment.length}/50)
                </p>
              </div>

              {/* Pros */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pros (Optional)
                </label>
                <textarea
                  value={reviewForm.pros}
                  onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="What are the advantages of this product?"
                />
              </div>

              {/* Cons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cons (Optional)
                </label>
                <textarea
                  value={reviewForm.cons}
                  onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="What are the disadvantages or areas for improvement?"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedImages.length > 0 ? (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Upload ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  )}
                  <label className="cursor-pointer">
                    <span className="text-sm text-green-600 font-medium hover:text-green-700">
                      {uploadedImages.length > 0 ? 'Add more photos' : 'Upload photos'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadedImages.length >= 5}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum 5 photos. JPG, PNG up to 5MB each
                  </p>
                </div>
              </div>

              {/* Would Recommend */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reviewForm.wouldRecommend}
                    onChange={(e) => setReviewForm({ ...reviewForm, wouldRecommend: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    I would recommend this product to others
                  </span>
                </label>
              </div>

              {/* Terms */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  By submitting this review, you agree that it's based on your own experience and is your genuine opinion. 
                  You have not been offered any incentive or payment to write this review.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewForm.rating === 0 || reviewForm.title.trim() === '' || reviewForm.comment.length < 50}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
