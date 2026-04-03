import api from './api';

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

const addressService = {
  // Get all addresses - with deduplication
  getAddresses: async () => {
    const key = 'getAddresses';
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    
    const promise = api.get('/addresses').then(response => {
      pendingRequests.delete(key);
      return response.data;
    }).catch(error => {
      pendingRequests.delete(key);
      throw error;
    });
    
    pendingRequests.set(key, promise);
    return promise;
  },

  // Create new address - prevent duplicate submissions
  createAddress: async (addressData) => {
    const key = 'createAddress_' + JSON.stringify(addressData);
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    
    const promise = api.post('/addresses', addressData).then(response => {
      pendingRequests.delete(key);
      return response.data;
    }).catch(error => {
      pendingRequests.delete(key);
      throw error;
    });
    
    pendingRequests.set(key, promise);
    setTimeout(() => pendingRequests.delete(key), 5000); // Clear after 5s
    return promise;
  },

  // Update address
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  // Set as default
  setDefaultAddress: async (id) => {
    const response = await api.put(`/addresses/${id}/set-default`);
    return response.data;
  },
};

export default addressService;
