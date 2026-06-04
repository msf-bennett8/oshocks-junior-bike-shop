import api from './api';

const attachmentService = {
  /**
   * Upload attachment to Cloudinary via backend
   */
  uploadCaseAttachment: async (file, caseId, messageId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    if (messageId) formData.append('message_id', messageId);

    return api.post(`/attachments/case/${caseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get attachment details
   */
  getAttachment: (attachmentId) => api.get(`/attachments/${attachmentId}`),

  /**
   * Delete attachment
   */
  deleteAttachment: (attachmentId) => api.delete(`/attachments/${attachmentId}`),
};

export default attachmentService;
