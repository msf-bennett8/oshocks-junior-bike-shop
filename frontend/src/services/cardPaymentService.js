// ============================================================================
// CARD PAYMENT SERVICE - Paystack Integration
// ============================================================================
import api from './api';

const cardPaymentService = {
  /**
   * Initialize card payment
   * @param {object} paymentData - {
   *   order_id: number,
   *   email: string
   * }
   * @returns {Promise} { authorization_url, reference, access_code }
   */
  initializePayment: async (paymentData) => {
    try {
      console.log('💳 Initializing card payment:', paymentData);
      const response = await api.post('/payments/card/initialize', paymentData);
      return response.data;
    } catch (error) {
      console.error('❌ Card payment initialization failed:', error);
      throw error;
    }
  },

  /**
   * Verify payment status
   * @param {string} reference - Paystack reference
   * @returns {Promise} Payment status
   */
  verifyPayment: async (reference) => {
    try {
      console.log('🔍 Verifying card payment:', reference);
      const response = await api.get(`/payments/card/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      throw error;
    }
  },

  /**
   * Open Paystack popup (inline payment)
   * @param {object} config - Paystack configuration
   */
  openPaystackPopup: (config) => {
    return new Promise((resolve, reject) => {
      if (!window.PaystackPop) {
        reject(new Error('Paystack script not loaded'));
        return;
      }

      const handler = window.PaystackPop.setup({
        key: config.publicKey,
        email: config.email,
        amount: config.amount * 100, // Convert to kobo
        currency: 'KES',
        ref: config.reference,
        metadata: config.metadata || {},
        callback: (response) => {
          console.log('✅ Paystack payment successful:', response);
          resolve(response);
        },
        onClose: () => {
          console.log('❌ Paystack popup closed');
          reject(new Error('Payment cancelled'));
        },
      });

      handler.openIframe();
    });
  },

  /**
   * Load Paystack script dynamically
   * @returns {Promise} Script loaded
   */
  loadPaystackScript: () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.body.appendChild(script);
    });
  },

  /**
   * Format amount for display
   * @param {number} amount 
   * @returns {string} Formatted amount
   */
  formatAmount: (amount) => {
    return `KES ${amount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  /**
   * Get test card numbers
   * @returns {object} Test cards
   */
  getTestCards: () => {
    return {
      success: {
        number: '4084084084084081',
        cvv: '408',
        expiry: '12/25',
        pin: '0000',
        otp: '123456'
      },
      failure: {
        number: '4084080000005409',
        cvv: '001',
        expiry: '12/25'
      }
    };
  }
};

export default cardPaymentService;
