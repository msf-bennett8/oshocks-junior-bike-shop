import api from './api';

const supportCaseService = {
  // User-facing support case operations
  getMyCases: (params = {}) => api.get('/v1/support-cases', { params }),
  getCase: (caseId) => api.get(`/v1/support-cases/${caseId}`),
  createCase: (data) => api.post('/v1/support-cases', data),
  escalateCase: (caseId, reason) => api.post(`/v1/support-cases/${caseId}/escalate`, { reason }),
  rateSatisfaction: (caseId, rating, comment) => api.post(`/v1/support-cases/${caseId}/satisfaction`, { rating, comment }),
  validateOrder: (orderNumber) => api.post('/v1/support-cases/validate-order', { order_number: orderNumber }),
  addNote: (caseId, content, isPrivate = true) => api.post(`/v1/support-cases/${caseId}/notes`, { content, is_private: isPrivate }),
  getHistory: (caseId) => api.get(`/v1/support-cases/${caseId}/history`),

  // Queue operations (admin/agent)
  getQueue: (params = {}) => api.get('/v1/support-queue', { params }),
  getMyQueueCases: () => api.get('/v1/support-queue/my-cases'),
  getQueueStats: () => api.get('/v1/support-queue/stats'),
  getAvailableAgents: () => api.get('/v1/support-queue/available-agents'),
  claimCase: (caseId) => api.post(`/v1/support-queue/${caseId}/claim`),
  assignCase: (caseId, agentId) => api.post(`/v1/support-queue/${caseId}/assign`, { agent_id: agentId }),
  transferCase: (caseId, agentId, reason) => api.post(`/v1/support-queue/${caseId}/transfer`, { agent_id: agentId, reason }),
  resolveCase: (caseId, resolutionNotes) => api.post(`/v1/support-queue/${caseId}/resolve`, { resolution_notes: resolutionNotes }),
  closeCase: (caseId) => api.post(`/v1/support-queue/${caseId}/close`),
  reopenCase: (caseId, reason) => api.post(`/v1/support-queue/${caseId}/reopen`, { reason }),
  getCaseNotes: (caseId) => api.get(`/v1/support-queue/${caseId}/notes`),

  // Super admin escalation
  getEscalatedCases: () => api.get('/v1/super-admin/support/escalated'),
  handleEscalation: (caseId, action, data = {}) => api.post(`/v1/super-admin/support/${caseId}/handle-escalation`, { action, ...data }),
};

export default supportCaseService;
