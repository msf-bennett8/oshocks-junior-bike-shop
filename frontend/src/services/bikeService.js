import api from './api';

const bikeService = {
  // ─── Public ───
  getBikes: (params = {}) => api.get('/bike-rentals', { params }),
  getBike: (listingCode) => api.get(`/bike-rentals/${listingCode}`),
  checkAvailability: (listingCode, start, end) => 
    api.get(`/bike-rentals/${listingCode}/availability`, { params: { start_datetime: start, end_datetime: end } }),
  getAvailabilityCalendar: (listingCode, month) => 
    api.get(`/bike-rentals/${listingCode}/calendar`, { params: { month } }),

  // ─── Protected (auth required) ───
  createListing: (data) => api.post('/bike-rentals', data),
  updateListing: (listingCode, data) => api.put(`/bike-rentals/${listingCode}`, data),
  deleteListing: (listingCode) => api.delete(`/bike-rentals/${listingCode}`),
  getMyListings: (params = {}) => api.get('/bike-rentals/my/listings', { params }),
  getListingStats: (listingCode) => api.get(`/bike-rentals/${listingCode}/stats`),

  // ─── Bookings ───
  createBooking: (data) => api.post('/bike-rental-bookings', data),
  getMyBookings: (params = {}) => api.get('/bike-rental-bookings/my-bookings', { params }),
  getOwnerBookings: (params = {}) => api.get('/bike-rental-bookings/owner-bookings', { params }),
  getBooking: (bookingCode) => api.get(`/bike-rental-bookings/${bookingCode}`),
  updateBookingStatus: (bookingCode, status, notes) => 
    api.post(`/bike-rental-bookings/${bookingCode}/status`, { status, notes }),
  cancelBooking: (bookingCode, reason) => 
    api.post(`/bike-rental-bookings/${bookingCode}/cancel`, { reason }),

  // ─── Admin Moderation ───
  getModerationListings: (params = {}) => api.get('/admin/bike-listings', { params }),
  getModerationStats: () => api.get('/admin/bike-listings/stats'),
  approveListing: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/approve`),
  rejectListing: (listingCode, reason) => api.post(`/admin/bike-listings/${listingCode}/reject`, { reason }),
  updateListingAdmin: (listingCode, data) => api.put(`/admin/bike-listings/${listingCode}/edit`, data),
  pauseListing: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/pause`),
  resumeListing: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/resume`),
  archiveListing: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/archive`),
  restoreArchiveListing: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/restore-archive`),
  markOutOfService: (listingCode, data) => api.post(`/admin/bike-listings/${listingCode}/out-of-service`, data),
  scheduleListingDeletion: (listingCode, reason) => api.post(`/admin/bike-listings/${listingCode}/schedule-deletion`, { reason }),
  approveListingDeletion: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/approve-deletion`),
  restoreListing: (listingCode) => api.post(`/admin/bike-listings/${listingCode}/restore`),
  permanentDeleteListing: (listingCode) => api.delete(`/admin/bike-listings/${listingCode}/permanent`),
};

export default bikeService;
