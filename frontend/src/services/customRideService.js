import api from './api';

/**
 * Build FormData with proper type coercion for Laravel
 */
const buildFormData = (data, files = []) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // Skip null/undefined values
    if (value === null || value === undefined) return;

    // Skip empty user_id (don't send it for guests)
    if (key === 'user_id' && !value) return;

    // Handle arrays (Laravel array notation)
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, String(item));
      });
      return;
    }

    // Convert booleans to integers (Laravel expects 1/0 for boolean validation)
    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }

    // Everything else as string
    formData.append(key, String(value));
  });

  // Append files
  files.forEach((file, index) => {
    if (file instanceof File) {
      formData.append(`images[${index}]`, file);
    }
  });

  return formData;
};

const customRideService = {
  createRequest: (data, imageFiles = []) => {
    const formData = buildFormData(data, imageFiles);

    return api.post('/custom-ride-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getMyRequests: (params = {}) => api.get('/custom-ride-requests/my-requests', { params }),
  getRequest: (requestId) => api.get(`/custom-ride-requests/${requestId}`),
  getAllRequests: (params = {}) => api.get('/custom-ride-requests', { params }),
  updateStatus: (requestId, status, staffNotes = '') =>
    api.post(`/custom-ride-requests/${requestId}/status`, { status, staff_notes: staffNotes }),
  getStats: () => api.get('/custom-ride-requests/stats'),

  // ─── Conversion to Event ───
  getConversionPreview: (requestId) => api.get(`/custom-ride-requests/${requestId}/conversion-preview`),
  convertToEvent: (requestId) => api.post(`/custom-ride-requests/${requestId}/convert-to-event`),
};

export default customRideService;