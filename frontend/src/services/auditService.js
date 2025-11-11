import api from './api';

const auditService = {
  // Get all audit logs with filters
  async getAuditLogs(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.event_type) queryParams.append('event_type', params.event_type);
    if (params.event_category) queryParams.append('event_category', params.event_category);
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.is_suspicious) queryParams.append('is_suspicious', params.is_suspicious);
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    
    const response = await api.get(`/audit-logs?${queryParams.toString()}`);
    return response.data;
  },

  // Get audit statistics
  async getAuditStats() {
    const response = await api.get('/audit-logs/stats');
    return response.data;
  },

  // Get suspicious activities
  async getSuspiciousActivities() {
    const response = await api.get('/audit-logs/suspicious');
    return response.data;
  },

  // Get audit logs by category
  async getByCategory(category) {
    const response = await api.get(`/audit-logs/category/${category}`);
    return response.data;
  },

  // Get audit logs by user
  async getByUser(userId) {
    const response = await api.get(`/audit-logs/user/${userId}`);
    return response.data;
  },

  // Get single audit log
  async getAuditLog(id) {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },

  // Export audit logs
  async exportAuditLogs(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.event_category) queryParams.append('event_category', params.event_category);
    
    const response = await api.get(`/audit-logs/export?${queryParams.toString()}`);
    return response.data;
  }
};

export default auditService;