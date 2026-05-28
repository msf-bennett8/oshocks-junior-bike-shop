import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Camera, Heart, MessageCircle, Share2, TrendingUp, MapPin,
  Clock, Filter, Grid3X3, List, Plus, Search, User, Award
} from 'lucide-react';
import CommunityPostCard from '../../components/community/CommunityPostCard';
import { MOCK_COMMUNITY_POSTS, MOCK_EVENTS } from '../../data/cyclingMockData';

const CommunityFeedPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filters = [
    { key: 'all', label: 'All Posts' },
    { key: 'featured', label: 'Featured' },
    { key: 'rides', label: 'Ride Reports' },
    { key: 'gear', label: 'Gear & Bikes' },
    { key: 'tips', label: 'Tips & Advice' },
  ];

  const filteredPosts = MOCK_COMMUNITY_POSTS.filter(post => {
    const searchMatch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user_name.toLowerCase().includes(searchQuery.toLowerCase());

    const filterMatch = activeFilter === 'all' ||
      (activeFilter === 'featured' && post.is_featured) ||
      (activeFilter === 'rides' && post.ride_distance_km > 0) ||
      (activeFilter === 'gear' && post.ride_distance_km === 0) ||
      (activeFilter === 'tips' && post.content.includes('tip'));

    return searchMatch && filterMatch;
  });

  // Stats
  const totalRides = MOCK_COMMUNITY_POSTS.reduce((sum, p) => sum + (p.ride_distance_km || 0), 0);
  const totalLikes = MOCK_COMMUNITY_POSTS.reduce((sum, p) => sum + p.likes_count, 0);
  const featuredCount = MOCK_COMMUNITY_POSTS.filter(p => p.is_featured).length;

  return (
    <>
      <Helmet>
        <title>Rider Community - Share Your Rides - Oshocks</title>
        <meta name="description" content="Join the Oshocks cycling community. Share ride photos, routes, and stories. Connect with fellow cyclists across Kenya." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/20">
                <Camera className="w-4 h-4 text-orange-400" />
                {MOCK_COMMUNITY_POSTS.length}+ Stories Shared
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Rider Community</h1>
              <p className="text-lg text-gray-300 mb-6">
                Share your cycling adventures, discover new routes, and connect with fellow riders across Kenya.
              </p>

              {/* Search */}
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, riders, or routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{MOCK_COMMUNITY_POSTS.length}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{totalRides}km</p>
                <p className="text-xs text-gray-500">Total Distance</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{totalLikes}</p>
                <p className="text-xs text-gray-500">Total Likes</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{featuredCount}</p>
                <p className="text-xs text-gray-500">Featured</p>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === f.key
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/community/create"
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Share Ride
              </Link>
            </div>
          </div>

          {/* Posts Grid/List */}
          {filteredPosts.length > 0 ? (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6 max-w-3xl mx-auto"
            }>
              {filteredPosts.map(post => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  compact={viewMode === 'grid'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <button
              onClick={() => alert('Demo: Would load more posts from API')}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all"
            >
              Load More Posts
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityFeedPage;