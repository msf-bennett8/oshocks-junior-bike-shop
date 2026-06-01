import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, Star, Trash2, RotateCcw, AlertTriangle, CheckCircle,
  XCircle, Search, Filter, Calendar, Clock, User, MessageSquare,
  Eye, ChevronLeft, ChevronRight, Flag, Archive, RefreshCw
} from 'lucide-react';
import communityService from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'all', label: 'All Posts', icon: MessageSquare },
  { key: 'featured', label: 'Featured', icon: Star },
  { key: 'scheduled', label: 'Scheduled for Deletion', icon: Clock },
  { key: 'auto-scheduled', label: 'Auto-Scheduled', icon: Calendar },
  { key: 'deleted', label: 'Deleted', icon: Trash2 },
];

const CommunityModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [activeTab, currentPage, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        tab: activeTab,
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await communityService.getModerationPosts(params);
      setPosts(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await communityService.getModerationStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleToggleFeatured = async (postCode) => {
    try {
      setActionLoading(true);
      await communityService.toggleFeatured(postCode);
      fetchPosts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle featured');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (!deletionReason.trim()) return;
    try {
      setActionLoading(true);
      await communityService.scheduleForDeletion(selectedPost.post_code, deletionReason);
      setShowScheduleModal(false);
      setDeletionReason('');
      setSelectedPost(null);
      fetchPosts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule deletion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDeletion = async (postCode) => {
    if (!window.confirm('Approve permanent deletion? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await communityService.approveDeletion(postCode);
      fetchPosts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve deletion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (postCode) => {
    try {
      setActionLoading(true);
      await communityService.restorePost(postCode);
      fetchPosts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore post');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (postCode) => {
    if (!window.confirm('PERMANENTLY DELETE? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await communityService.permanentDelete(postCode);
      fetchPosts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setActionLoading(false);
    }
  };

  const openScheduleModal = (post) => {
    setSelectedPost(post);
    setShowScheduleModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Community Moderation | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Community Moderation</h1>
          </div>
          <p className="text-gray-600">Manage community posts, feature content, and schedule deletions.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Posts', value: stats.total_posts, icon: MessageSquare, color: 'blue' },
              { label: 'Featured', value: stats.featured_posts, icon: Star, color: 'yellow' },
              { label: 'Scheduled', value: stats.scheduled_for_deletion, icon: Clock, color: 'orange' },
              { label: 'Auto-Scheduled', value: stats.auto_scheduled, icon: Calendar, color: 'purple' },
              { label: 'Deleted', value: stats.soft_deleted, icon: Trash2, color: 'red' },
              { label: 'Pending Approval', value: stats.pending_approval, icon: AlertTriangle, color: 'pink' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-white rounded-xl p-4 border border-${stat.color}-100 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="container mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="flex overflow-x-auto border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Posts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No posts found</td></tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.post_code} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.images?.[0]?.cloudinary_secure_url || post.photos?.[0] || '/placeholder-bike.jpg'}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                            <p className="text-xs text-gray-500">{post.post_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {post.user_initials || 'A'}
                          </div>
                          <span className="text-gray-700">{post.user_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {post.is_featured && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3 inline mr-1" />Featured
                            </span>
                          )}
                          {post.scheduled_for_deletion_at && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {post.days_until_deletion > 0 ? `${post.days_until_deletion}d left` : 'Due'}
                            </span>
                          )}
                          {post.deleted_at && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              <Trash2 className="w-3 h-3 inline mr-1" />Deleted
                            </span>
                          )}
                          {post.deletion_approved_by && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3 inline mr-1" />Approved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Feature Toggle */}
                          <button
                            onClick={() => handleToggleFeatured(post.post_code)}
                            disabled={actionLoading || post.deleted_at}
                            className={`p-1.5 rounded-lg transition-colors ${
                              post.is_featured
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={post.is_featured ? 'Unfeature' : 'Feature'}
                          >
                            <Star className="w-4 h-4" />
                          </button>

                          {/* View */}
                          <button
                            onClick={() => navigate(`/community/${post.post_code}`)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            title="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Schedule Deletion */}
                          {!post.scheduled_for_deletion_at && !post.deleted_at && (
                            <button
                              onClick={() => openScheduleModal(post)}
                              disabled={actionLoading}
                              className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                              title="Schedule deletion"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Approve Deletion (Super Admin only) */}
                          {post.scheduled_for_deletion_at && !post.deletion_approved_by && isSuperAdmin && (
                            <button
                              onClick={() => handleApproveDeletion(post.post_code)}
                              disabled={actionLoading}
                              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Approve deletion"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Restore */}
                          {(post.scheduled_for_deletion_at || post.deleted_at) && (
                            <button
                              onClick={() => handleRestore(post.post_code)}
                              disabled={actionLoading}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="Restore"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Permanent Delete (Super Admin only) */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handlePermanentDelete(post.post_code)}
                              disabled={actionLoading}
                              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Permanent delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Deletion Modal */}
      {showScheduleModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule for Deletion</h3>
            <p className="text-gray-600 text-sm mb-4">
              Post will be permanently deleted in 30 days. Super admin approval is required.
            </p>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Reason for deletion..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowScheduleModal(false); setSelectedPost(null); setDeletionReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleDeletion}
                disabled={!deletionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {actionLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityModerationPage;