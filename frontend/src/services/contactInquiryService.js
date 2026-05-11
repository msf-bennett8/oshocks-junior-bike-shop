import api from './api';

const contactInquiryService = {
  /** Submit contact form (guest + auth) */
  submitInquiry: (data) => api.post('/contact-inquiries', data),

  /** Get my inquiries */
  getMyInquiries: (params = {}) => api.get('/contact-inquiries/my-inquiries', { params }),

  /** Get inquiry queue (admin/agent) */
  getQueue: (params = {}) => api.get('/contact-inquiries/queue', { params }),
};

export default contactInquiryService;
