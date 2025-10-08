import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  addItem: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { product_id: productId, quantity });
    return response.data;
  },
};

export default cartService;
