import api from './api';

const supportCaseService = {
  // User-facing support case operations
  getMyCases: (params = {}) => api.get('/support-cases', { params }),
  getCase: (caseId) => api.get(`/support-cases/${caseId}`),
  createCase: (data) => api.post('/support-cases', data),
  escalateCase: (caseId, reason) => api.post(`/support-cases/${caseId}/escalate`, { reason }),
  rateSatisfaction: (caseId, rating, comment) => api.post(`/support-cases/${caseId}/satisfaction`, { rating, comment }),
  validateOrder: (purchaseId) => api.post('/support-cases/validate-order', { purchase_id: purchaseId }),
  addNote: (caseId, content, isPrivate = true) => api.post(`/support-cases/${caseId}/notes`, { content, is_private: isPrivate }),
  getHistory: (caseId) => api.get(`/support-cases/${caseId}/history`),

  // Queue operations (admin/agent)
  getQueue: (params = {}) => api.get('/support-queue', { params }),
  getMyQueueCases: () => api.get('/support-queue/my-cases'),
  getQueueStats: () => api.get('/support-queue/stats'),
  getAvailableAgents: () => api.get('/support-queue/available-agents'),
  claimCase: (caseId) => api.post(`/support-queue/${caseId}/claim`),
  assignCase: (caseId, agentId) => api.post(`/support-queue/${caseId}/assign`, { agent_id: agentId }),
  transferCase: (caseId, agentId, reason) => api.post(`/support-queue/${caseId}/transfer`, { agent_id: agentId, reason }),
  resolveCase: (caseId, resolutionNotes) => api.post(`/support-queue/${caseId}/resolve`, { resolution_notes: resolutionNotes }),
  closeCase: (caseId) => api.post(`/support-queue/${caseId}/close`),
  reopenCase: (caseId, reason) => api.post(`/support-queue/${caseId}/reopen`, { reason }),
  getCaseNotes: (caseId) => api.get(`/support-queue/${caseId}/notes`),
  getHistory: (params = {}) => api.get('/support-queue/history', { params }),

  // Super admin escalation
  getEscalatedCases: () => api.get('/super-admin/support/escalated'),
  handleEscalation: (caseId, action, data = {}) => api.post(`/super-admin/support/${caseId}/handle-escalation`, { action, ...data }),

  // Case threading (hybrid conversational ticketing)
  createCaseInConversation: (conversationId, data) => api.post(`/conversations/${conversationId}/cases`, data),
  getConversationCases: (conversationId) => api.get(`/conversations/${conversationId}/cases`),
  getCaseMessages: (conversationId, caseId, includeFullConversation = false) => 
    api.get(`/conversations/${conversationId}/cases/${caseId}/messages`, {
      params: { include_full_conversation: includeFullConversation }
    }),
  sendCaseMessage: (conversationId, caseId, body, type = 'text') => api.post(`/conversations/${conversationId}/cases/${caseId}/messages`, { body, type }),
  deleteCase: (caseId) => api.delete(`/support-cases/${caseId}`),
  restoreCase: (caseId) => api.post(`/support-cases/${caseId}/restore`),
  getUserCaseHistory: () => api.get('/user/case-history'),
};

export default supportCaseService;
