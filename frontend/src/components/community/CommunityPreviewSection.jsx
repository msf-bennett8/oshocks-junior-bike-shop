import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ChevronRight, Camera } from 'lucide-react';
import CommunityPostCard from './CommunityPostCard';
import { MOCK_COMMUNITY_POSTS } from '../../data/cyclingMockData';

const CommunityPreviewSection = () => {
  const featuredPosts = MOCK_COMMUNITY_POSTS.slice(0, 3);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              Rider Community
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Share Your Rides</h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Join our community of cyclists. Share photos, routes, and stories from your adventures.
            </p>
          </div>
          <Link 
            to="/community" 
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all whitespace-nowrap"
          >
            Explore Community
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map(post => (
            <CommunityPostCard 
              key={post.id} 
              post={post} 
              compact
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/community/create"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-bold hover:bg-gray-900 hover:text-white transition-all"
          >
            <Camera className="w-5 h-5" />
            Share Your Ride Story
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityPreviewSection;
