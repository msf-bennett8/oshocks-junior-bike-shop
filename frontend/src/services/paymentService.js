import api from './api';

export const paymentService = {
  initiateMpesa: async (paymentData) => {
    const response = await api.post('/payments/mpesa', paymentData);
    return response.data;
  },
};

export default paymentService;
