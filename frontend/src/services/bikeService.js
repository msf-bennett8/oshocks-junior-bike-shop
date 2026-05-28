import api from './api';

const bikeService = {
  // ─── Public ───
  getBikes: (params = {}) => api.get('/bike-rentals', { params }),
  getBike: (listingCode) => api.get(`/bike-rentals/${listingCode}`),

  // ─── Protected (auth required) ───
  createListing: (data) => api.post('/bike-rentals', data),
  updateListing: (listingCode, data) => api.put(`/bike-rentals/${listingCode}`, data),
  deleteListing: (listingCode) => api.delete(`/bike-rentals/${listingCode}`),
  getMyListings: (params = {}) => api.get('/bike-rentals/my/listings', { params }),
  getListingStats: (listingCode) => api.get(`/bike-rentals/${listingCode}/stats`),
};

export default bikeService;
