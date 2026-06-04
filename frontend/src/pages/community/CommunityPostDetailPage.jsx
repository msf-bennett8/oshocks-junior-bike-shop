import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Heart, MessageCircle, Share2, Bookmark, ChevronLeft, MapPin,
  Clock, TrendingUp, Zap, Flame, Navigation, Bike, Calendar,
  User, Send, MoreHorizontal, Flag, CheckCircle2, X
} from 'lucide-react';
import communityService from '../../services/communityService';
import { MOCK_EVENTS } from '../../data/cyclingMockData';
import CommunityPostCard from '../../components/community/CommunityPostCard';

const CommunityPostDetailPage = () => {
  const { postCode } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await communityService.getPost(postCode);
        const postData = response.data?.data || response.data;
        setPost(postData);
        setLikeCount(postData?.likes_count || 0);
        setError(null);

        // Fetch related posts by same user
        if (postData?.user_id) {
          const relatedResponse = await communityService.getPosts({ user_id: postData.user_id, per_page: 4 });
          const relatedData = relatedResponse.data?.data || relatedResponse.data || [];
          setRelatedPosts(relatedData.filter(p => p.post_code !== postData.post_code && p.id !== postData.id).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postCode]);

  const linkedEvent = post?.event_id ? MOCK_EVENTS.find(e => e.id === post.event_id) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error ? 'Error' : 'Post Not Found'}</h1>
          <p className="text-gray-500 mb-4">{error || 'This ride story doesn\'t exist or was removed.'}</p>
          <Link to="/community" className="text-orange-500 font-semibold hover:underline">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [{
      id: Date.now(),
      user_name: 'You',
      text: commentText,
      created_at: new Date().toISOString(),
      likes: 0
    }, ...prev]);
    setCommentText('');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  const stats = [
    { icon: MapPin, label: 'Distance', value: `${post.ride_distance_km}km`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Clock, label: 'Duration', value: `${Math.floor(post.ride_duration_minutes / 60)}h ${post.ride_duration_minutes % 60}m`, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: TrendingUp, label: 'Elevation', value: `${post.elevation_gain_m}m`, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  // Add optional stats if present
  if (post.avg_speed_kmh) {
    stats.push({ icon: Navigation, label: 'Avg Speed', value: `${post.avg_speed_kmh}km/h`, color: 'text-purple-600', bg: 'bg-purple-50' });
  }
  if (post.max_speed_kmh) {
    stats.push({ icon: Zap, label: 'Max Speed', value: `${post.max_speed_kmh}km/h`, color: 'text-red-600', bg: 'bg-red-50' });
  }
  if (post.calories_burned) {
    stats.push({ icon: Flame, label: 'Calories', value: `${post.calories_burned}`, color: 'text-amber-600', bg: 'bg-amber-50' });
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - {post.user_name} - Oshocks Community</title>
        <meta name="description" content={post.content.slice(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">{post.title}</h1>
              <p className="text-xs text-gray-500">by {post.user_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button 
                      onClick={() => { navigator.clipboard.writeText(window.location.href); setShowShareMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Copy Link
                    </button>
                    <button 
                      onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${window.location.href}`)}`, '_blank'); setShowShareMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> WhatsApp
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                      <Flag className="w-4 h-4" /> Report Post
                    </button>
                  </div>
                )}
              </button>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-orange-500 text-orange-500' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Author Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(post.user_name || 'A').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">{post.user_name || 'Anonymous'}</h2>
              <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
            </div>
            {post.visibility === 'public' && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                Public
              </span>
            )}
          </div>

          {/* Title & Story */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="prose prose-orange max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{post.content}</p>
          </div>

          {/* Linked Event Card */}
          {linkedEvent && (
            <Link
              to={`/events/${linkedEvent.slug}`}
              className="block mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Linked Event</p>
                  <p className="font-bold text-gray-900">{linkedEvent.title}</p>
                  <p className="text-sm text-gray-600">{linkedEvent.distance_km}km • {linkedEvent.difficulty}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-orange-400 rotate-180" />
              </div>
            </Link>
          )}

          {/* Photo Gallery */}
          {(post.photos?.length > 0 || post.images?.length > 0) && (
            <div className="mb-8">
              {/* Main Photo */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-3">
                <img
                  src={post.images?.[activePhotoIndex]?.cloudinary_secure_url || post.photos?.[activePhotoIndex] || '/placeholder-bike.jpg'}
                  alt={`${post.title} - photo ${activePhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {post.photos[activePhotoIndex + 1] && (
                  <button
                    onClick={() => setActivePhotoIndex(prev => prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                )}
                {activePhotoIndex > 0 && (
                  <button
                    onClick={() => setActivePhotoIndex(prev => prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                  {activePhotoIndex + 1} / {post.photos.length}
                </div>
              </div>
              {/* Thumbnails */}
              {(post.photos?.length > 1 || post.images?.length > 1) && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(post.images || post.photos || []).map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhotoIndex(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activePhotoIndex ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent'
                      }`}
                    >
                      <img src={photo?.cloudinary_secure_url || photo?.cloudinary_thumbnail_url || photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Photo Captions */}
              {(post.images?.[activePhotoIndex]?.caption || post.photo_captions?.[activePhotoIndex]) && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  {post.images?.[activePhotoIndex]?.caption || post.photo_captions?.[activePhotoIndex]}
                </p>
              )}
            </div>
          )}

          {/* Stats Dashboard */}
          {(post.ride_distance_km > 0 || post.ride_duration_minutes > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`${stat.bg} rounded-xl p-4 text-center`}>
                    <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Equipment Used */}
          {(post.bike_used || post.gear?.length > 0) && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Bike className="w-5 h-5 text-gray-600" />
                Equipment
              </h3>
              {post.bike_used && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Bike:</span>
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-gray-900 border border-gray-200">
                    {post.bike_used}
                  </span>
                </div>
              )}
              {post.gear?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Gear:</span>
                  {post.gear.map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded text-xs text-gray-700 border border-gray-200">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mood / Feeling */}
          {post.mood && (
            <div className="mb-8 flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <span className="text-2xl">
                {post.mood === 'amazing' ? '🤩' : post.mood === 'good' ? '😊' : post.mood === 'tired' ? '😅' : post.mood === 'challenging' ? '💪' : post.mood === 'epic' ? '🔥' : '😊'}
              </span>
              <div>
                <p className="text-sm text-gray-500">How it felt</p>
                <p className="font-bold text-gray-900 capitalize">{post.mood}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Bar */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 mb-8">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 font-semibold transition-all ${liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-red-500' : ''}`} />
              <span>{post.likes_count + likeCount}</span>
            </button>
            <button className="flex items-center gap-2 font-semibold text-gray-600 hover:text-blue-500 transition-all">
              <MessageCircle className="w-6 h-6" />
              <span>{post.comments_count + comments.length}</span>
            </button>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 font-semibold text-gray-600 hover:text-green-500 transition-all"
            >
              <Share2 className="w-6 h-6" />
              <span>Share</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Comments ({post.comments_count + comments.length})</h3>

            {/* Comment Input */}
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                Y
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.user_name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-xl px-4 py-3">
                      <p className="font-semibold text-sm text-gray-900">{comment.user_name}</p>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-4">
                      <button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
                      <button className="text-xs text-gray-500 hover:text-gray-700">Reply</button>
                      <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-gray-400 py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">More from {post.user_name || 'this rider'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map(p => (
                  <CommunityPostCard key={p.post_code || p.id} post={p} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityPostDetailPage;
