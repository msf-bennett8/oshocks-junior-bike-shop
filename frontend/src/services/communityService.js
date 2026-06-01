import api from './api';

const communityService = {
  // ─── Public ───
  getPosts: (params = {}) => api.get('/community/posts', { params }),
  getPost: (postCode) => api.get(`/community/posts/${postCode}`),

  // ─── Protected (auth required) ───
  createPost: (data) => api.post('/community/posts', data),
  updatePost: (postCode, data) => api.put(`/community/posts/${postCode}`, data),
  deletePost: (postCode) => api.delete(`/community/posts/${postCode}`),
  getMyPosts: (params = {}) => api.get('/community/my/posts', { params }),
  toggleLike: (postCode) => api.post(`/community/posts/${postCode}/like`),

  // ─── Admin Moderation ───
  getModerationPosts: (params = {}) => api.get('/admin/community-posts', { params }),
  getModerationStats: () => api.get('/admin/community-posts/stats'),
  toggleFeatured: (postCode) => api.post(`/admin/community-posts/${postCode}/feature`),
  scheduleForDeletion: (postCode, reason) => api.post(`/admin/community-posts/${postCode}/schedule-deletion`, { reason }),
  approveDeletion: (postCode) => api.post(`/admin/community-posts/${postCode}/approve-deletion`),
  restorePost: (postCode) => api.post(`/admin/community-posts/${postCode}/restore`),
  permanentDelete: (postCode) => api.delete(`/admin/community-posts/${postCode}/permanent`),
};

export default communityService;
