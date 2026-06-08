import api from './api';

const resourceService = {
  // ─── Public ───
  getResources: (params = {}) => api.get('/resources', { params }),
  getResource: (resourceCode, params = {}) => api.get(`/resources/${resourceCode}`, { params }),
  checkAvailability: (resourceCode, start, end, quantity = 1) =>
    api.get(`/resources/${resourceCode}/availability`, { params: { start_datetime: start, end_datetime: end, quantity } }),
  getAvailableResources: (start, end, params = {}) =>
    api.get('/resources/available', { params: { start_datetime: start, end_datetime: end, ...params } }),
  getResourceStats: (resourceCode) => api.get(`/resources/${resourceCode}/stats`),

  // ─── Protected (Upload/Edit) ───
  createResource: (data) => api.post('/resources', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateResource: (resourceCode, data) => api.put(`/resources/${resourceCode}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteResource: (resourceCode) => api.delete(`/resources/${resourceCode}`),
  getMyResources: (params = {}) => api.get('/resources/my/resources', { params }),

  // ─── Bookings ───
  createBooking: (data) => api.post('/resource-bookings', data),
  getMyBookings: (params = {}) => api.get('/resource-bookings/my-bookings', { params }),
  getBooking: (bookingCode) => api.get(`/resource-bookings/${bookingCode}`),
  cancelBooking: (bookingCode, reason) => api.post(`/resource-bookings/${bookingCode}/cancel`, { reason }),
  updateBookingStatus: (bookingCode, status, notes) =>
    api.post(`/resource-bookings/${bookingCode}/status`, { status, notes }),

  // ─── Admin Moderation ───
  getModerationResources: (params = {}) => api.get('/admin/resources', { params }),
  getModerationStats: () => api.get('/admin/resources/stats'),
  approveResource: (resourceCode) => api.post(`/admin/resources/${resourceCode}/approve`),
  rejectResource: (resourceCode, reason) => api.post(`/admin/resources/${resourceCode}/reject`, { reason }),
  pauseResource: (resourceCode) => api.post(`/admin/resources/${resourceCode}/pause`),
  resumeResource: (resourceCode) => api.post(`/admin/resources/${resourceCode}/resume`),
  markOutOfService: (resourceCode, data) => api.post(`/admin/resources/${resourceCode}/out-of-service`, data),
  updatePricingRules: (resourceCode, rules) => api.put(`/admin/resources/${resourceCode}/pricing-rules`, { rules }),
  forcePriceUpdate: (resourceCode) => api.post(`/admin/resources/${resourceCode}/force-price-update`),
  adjustInventory: (resourceCode, adjustment, reason) =>
    api.post(`/admin/resources/${resourceCode}/adjust-inventory`, { adjustment, reason }),

  // ─── Admin Booking Moderation ───
  getModerationBookings: (params = {}) => api.get('/admin/resources/bookings', { params }),
  markReturned: (bookingCode, notes) => api.post(`/admin/resources/bookings/${bookingCode}/returned`, { notes }),
  completeRecirculation: (bookingCode) => api.post(`/admin/resources/bookings/${bookingCode}/complete-recirculation`),
  batchRecirculate: (bookingIds) => api.post('/admin/resources/bookings/batch-recirculate', { booking_ids: bookingIds }),
  getPendingRecirculation: () => api.get('/admin/resources/bookings/pending-recirculation'),
  getPendingAutoReturn: () => api.get('/admin/resources/bookings/pending-auto-return'),
  autoRecirculate: () => api.post('/admin/resources/auto-recirculate'),
  autoRecirculateEvent: (eventId) => api.post(`/admin/resources/events/${eventId}/auto-recirculate`),

    // ─── Public Resource Pages ───
  getResource: (resourceCode, params = {}) => api.get(`/resources/${resourceCode}`, { params }),
  checkAvailability: (resourceCode, start, end, quantity = 1) =>
    api.get(`/resources/${resourceCode}/availability`, { params: { start_datetime: start, end_datetime: end, quantity } }),
  getAvailableResources: (start, end, params = {}) =>
    api.get('/resources/available', { params: { start_datetime: start, end_datetime: end, ...params } }),

  // ─── Resource Bookings ───
  createBooking: (data) => api.post('/resource-bookings', data),
  getMyBookings: (params = {}) => api.get('/resource-bookings/my-bookings', { params }),
  getBooking: (bookingCode) => api.get(`/resource-bookings/${bookingCode}`),
  cancelBooking: (bookingCode, reason) => api.post(`/resource-bookings/${bookingCode}/cancel`, { reason }),
  updateBookingStatus: (bookingCode, status, notes) =>
    api.post(`/resource-bookings/${bookingCode}/status`, { status, notes }),

  // ─── Integration APIs ───
  linkToBikeRental: (resourceBookingId, bikeRentalBookingId) =>
    api.post('/resource-bookings/link-to-bike', { resource_booking_id: resourceBookingId, bike_rental_booking_id: bikeRentalBookingId }),
  linkToEvent: (resourceBookingId, eventId) =>
    api.post('/resource-bookings/link-to-event', { resource_booking_id: resourceBookingId, event_id: eventId }),
  getAvailableForBikeRental: (start, end, params = {}) =>
    api.get('/resource-bookings/available-for-bike', { params: { start_datetime: start, end_datetime: end, ...params } }),
  getAvailableForEvent: (eventId, params = {}) =>
    api.get(`/resource-bookings/available-for-event/${eventId}`, { params }),
};

export default resourceService;
