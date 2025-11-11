import api from './api';

const auditService = {
  // ========== ACTIVE AUDIT LOGS ==========
  
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
  },

  // ========== DELETION & CLEANUP ==========

  // Delete/cleanup audit logs
  async deleteAuditLogs(params = {}) {
    const response = await api.post('/audit-logs/retention/cleanup', {
      ...params,
      dry_run: false
    });
    return response.data;
  },

  // Preview deletion (dry run)
  async previewDeletion(params = {}) {
    const response = await api.post('/audit-logs/retention/cleanup', {
      ...params,
      dry_run: true
    });
    return response.data;
  },

  // Get retention statistics
  async getRetentionStats() {
    const response = await api.get('/audit-logs/retention/stats');
    return response.data;
  },

  // ========== ARCHIVES ==========

  // Get archived logs with filters
  async getArchivedLogs(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.page) queryParams.append('page', params.page);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.event_type) queryParams.append('event_type', params.event_type);
    if (params.event_category) queryParams.append('event_category', params.event_category);
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.archive_reason) queryParams.append('archive_reason', params.archive_reason);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    
    const response = await api.get(`/audit-logs/archives?${queryParams.toString()}`);
    return response.data;
  },

  // Get single archived log
  async getArchivedLog(id) {
    const response = await api.get(`/audit-logs/archives/${id}`);
    return response.data;
  },

  // Restore archived log to active logs
  async restoreArchivedLog(id) {
    const response = await api.post(`/audit-logs/archives/${id}/restore`);
    return response.data;
  },

  // Bulk restore archived logs
  async bulkRestoreArchives(ids) {
    const response = await api.post('/audit-logs/archives/bulk-restore', {
      archive_ids: ids
    });
    return response.data;
  },

  // Permanently delete archived log
  async permanentlyDeleteArchive(id) {
    const response = await api.delete(`/audit-logs/archives/${id}`);
    return response.data;
  },

  // Bulk permanently delete archived logs
  async bulkDeleteArchives(ids) {
    const response = await api.post('/audit-logs/archives/bulk-delete', {
      archive_ids: ids
    });
    return response.data;
  },

  // Get archive statistics
  async getArchiveStats() {
    const response = await api.get('/audit-logs/archives/stats');
    return response.data;
  },

  // Export archived logs
  async exportArchivedLogs(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.archive_reason) queryParams.append('archive_reason', params.archive_reason);
    
    const response = await api.get(`/audit-logs/archives/export?${queryParams.toString()}`);
    return response.data;
  }
};

export default auditService;