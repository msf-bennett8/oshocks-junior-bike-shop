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
};

export default communityService;
