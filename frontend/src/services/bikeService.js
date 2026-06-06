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
  getBooking: (bookingCode) => api.get(`/bike-rental-bookings/${bookingCode}`),

  // ─── Bike Rental Payments ───
  initiateBikeRentalMpesa: (data) => api.post('/bike-rental-payments/mpesa/initiate', data),
  initiateBikeRentalCard: (data) => api.post('/bike-rental-payments/card/initialize', data),
  bikeRentalCod: (data) => api.post('/bike-rental-payments/cod', data),
  checkBikeRentalPaymentStatus: (paymentId) => api.get(`/bike-rental-payments/${paymentId}/status`),
  verifyBikeRentalCardPayment: (reference) => api.get(`/bike-rental-payments/card/verify/${reference}`),
  getBikeRentalTicket: (bookingCode) => api.get(`/bike-rental-bookings/${bookingCode}/ticket`),
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

  // ─── Admin Booking Moderation ───
  getAdminBookings: (params = {}) => api.get('/admin/bike-bookings', { params }),
  getAdminBookingStats: () => api.get('/admin/bike-bookings/stats'),
  recirculateBike: (bookingCode) => api.post(`/admin/bike-bookings/${bookingCode}/recirculate`),
  refundDeposit: (bookingCode) => api.post(`/admin/bike-bookings/${bookingCode}/refund-deposit`),
  applyFine: (bookingCode, amount) => api.post(`/admin/bike-bookings/${bookingCode}/apply-fine`, { amount }),
  removeFine: (bookingCode) => api.post(`/admin/bike-bookings/${bookingCode}/remove-fine`),

  // ─── Availability with Conflict Resolution ───
  getAvailableBikes: (start, end, filters = {}) => api.get('/bike-rentals/available', {
    params: { start_datetime: start, end_datetime: end, ...filters }
  }),
  
  // ─── Current Availability (no dates required) ───
  getCurrentAvailability: (listingCode) => api.get(`/bike-rentals/${listingCode}/current-availability`),

  // ─── Lister Payout ───
  getListerPayoutDashboard: () => api.get('/bike-lister/payout-dashboard'),
  getListerPayoutHistory: (params = {}) => api.get('/bike-lister/payout-history', { params }),
  requestPayout: (payoutId) => api.post(`/bike-lister/payouts/${payoutId}/request`),
  updatePayoutPreference: (period) => api.put('/bike-lister/payout-preference', { payout_period: period }),

  // ─── Terms ───
  getTermsStatus: () => api.get('/terms/status'),
  acceptTerms: (termsType) => api.post('/terms/accept', { terms_type: termsType }),
  checkTerms: (termsType) => api.get('/terms/check', { params: { terms_type: termsType } }),
};

export default bikeService;
