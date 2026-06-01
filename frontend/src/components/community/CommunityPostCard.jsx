import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, TrendingUp, Clock } from 'lucide-react';

const CommunityPostCard = ({ post, compact = false }) => {
  if (!post) return null;

  // Handle both API structure (images array with objects) and legacy mock structure (photos array of strings)
  const displayImage = post.images?.[0]?.cloudinary_secure_url 
    || post.photos?.[0] 
    || post.images?.[0] 
    || '/placeholder-bike.jpg';
  
  const userName = post.user_name || post.user?.name || 'Anonymous';
  const userInitials = post.user_initials || userName.split(' ').map(n => n[0]).join('');
  if (compact) {
    return (
      <Link to={`/community/${post.post_code || post.id}`} className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="relative h-32 overflow-hidden">
          <img
            src={displayImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h4 className="text-sm font-bold text-white line-clamp-1">{post.title}</h4>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-[10px]">
              {userInitials}
            </div>
            <span className="text-xs font-semibold text-gray-800">{userName}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-0.5">
              <Heart className="w-3 h-3" />
              {post.likes_count}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="w-3 h-3" />
              {post.comments_count}
            </span>
            {post.ride_distance_km > 0 && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {post.ride_distance_km}km
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/community/${post.post_code || post.id}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="relative h-48 overflow-hidden">
          <img
            src={displayImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white">{post.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-[10px]">
              {userInitials}
            </div>
            <span className="text-sm text-white/90">{userName}</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>
        
        {post.ride_distance_km > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="font-semibold">{post.ride_distance_km}km</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-semibold">{Math.round(post.ride_duration_minutes / 60)}h {post.ride_duration_minutes % 60}m</span>
            </div>
            {post.elevation_gain_m > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">{post.elevation_gain_m}m</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-semibold">{post.likes_count}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{post.comments_count}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CommunityPostCard;
