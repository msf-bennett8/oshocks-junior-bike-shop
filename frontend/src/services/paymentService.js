// ============================================================================
// PAYMENT SERVICE - M-Pesa Daraja & Card Payment API Calls
// ============================================================================
import api from './api';

const paymentService = {
  // ============================================================================
  // M-PESA STK PUSH PAYMENTS
  // ============================================================================
  
  /**
   * Initiate M-Pesa STK Push payment
   * @param {object} paymentData - {
   *   order_id: number,
   *   phone_number: string (0712345678 or 254712345678)
   * }
   * @returns {Promise} Payment initiation response
   */
  initiateMpesa: async (paymentData) => {
    try {
      console.log('📱 Initiating M-Pesa payment:', paymentData);
      const response = await api.post('/payments/mpesa/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('❌ M-Pesa initiation failed:', error);
      throw error;
    }
  },

  /**
   * Check payment status by payment ID
   * @param {number} paymentId 
   * @returns {Promise} Payment details
   */
  checkPaymentStatus: async (paymentId) => {
    try {
      console.log('⏳ Checking payment status:', paymentId);
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Payment status check failed:', error);
      throw error;
    }
  },

  /**
   * Poll payment status until completion (for UI polling)
   * @param {number} paymentId 
   * @param {function} onStatusChange - Callback when status changes
   * @param {number} maxAttempts - Max polling attempts (default 30)
   * @param {number} interval - Poll interval in ms (default 3000)
   */
  pollPaymentStatus: async (paymentId, onStatusChange, maxAttempts = 30, interval = 3000) => {
    let attempts = 0;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        throw new Error('Payment status check timeout');
      }
      
      attempts++;
      const response = await paymentService.checkPaymentStatus(paymentId);
      const status = response.data?.status;
      
      onStatusChange(status, response.data);
      
      if (status === 'completed' || status === 'failed') {
        return response.data;
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
      return poll();
    };
    
    return poll();
  },

  // ============================================================================
  // CARD PAYMENTS
  // ============================================================================
  
  /**
   * Initiate card payment (Flutterwave/Stripe)
   * @param {object} paymentData - {
   *   order_id: number,
   *   card_details: object,
   *   amount: number
   * }
   * @returns {Promise} Card payment response
   */
    initiateCard: async (paymentData) => {
    try {
      console.log('========================================');
      console.log('💳 [initiateCard] STARTING');
      console.log('========================================');
      console.log('📋 Payment Data:', JSON.stringify(paymentData, null, 2));
      console.log('🔧 API Base URL:', api.defaults.baseURL);
      console.log('🔐 Auth Token:', localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING');
      
      // CRITICAL FIX: Using /initialize NOT /initiate
      const endpoint = '/payments/card/initialize';
      console.log('🚀 POST to:', api.defaults.baseURL + endpoint);
      
      const response = await api.post(endpoint, paymentData);
      
      console.log('✅ [initiateCard] SUCCESS - Status:', response.status);
      console.log('📦 Response:', JSON.stringify(response.data, null, 2));
      console.log('🔗 Auth URL:', response.data?.data?.authorization_url);
      console.log('========================================');
      
      return response.data;
    } catch (error) {
      console.error('========================================');
      console.error('❌ [initiateCard] FAILED');
      console.error('========================================');
      console.error('📍 Request URL:', error.config?.url);
      console.error('📍 Full Path:', error.config?.baseURL + error.config?.url);
      console.error('📊 Status:', error.response?.status, error.response?.statusText);
      console.error('📦 Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('📝 Error Message:', error.message);
      console.error('========================================');
      throw error;
    }
  },

    /**
   * Verify card payment by reference (for callback)
   * @param {string} reference - Paystack transaction reference
   * @returns {Promise} Verification response
   */
  verifyPayment: async (reference) => {
    try {
      console.log('🔍 Verifying card payment:', reference);
      const response = await api.get(`/payments/card/verify/${reference}`);
      console.log('✅ Verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      throw error;
    }
  },

  // ============================================================================
  // MANUAL PAYMENT RECORDING (For Cash/Bank)
  // ============================================================================
  
  /**
   * Record manual payment (cash, bank transfer, manual M-Pesa)
   * @param {object} paymentData - {
   *   order_id: number,
   *   payment_method: 'cash'|'bank_transfer'|'mpesa_manual',
   *   amount: number,
   *   transaction_reference?: string,
   *   notes?: string
   * }
   * @returns {Promise} Recorded payment
   */
  recordManualPayment: async (paymentData) => {
    try {
      console.log('📝 Recording manual payment:', paymentData);
      const response = await api.post('/payments/record', paymentData);
      return response.data;
    } catch (error) {
      console.error('❌ Manual payment recording failed:', error);
      throw error;
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Format phone number for M-Pesa (2547XXXXXXXX)
   * @param {string} phone 
   * @returns {string} Formatted phone
   */
  formatPhoneNumber: (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  },

  /**
   * Validate M-Pesa phone number
   * @param {string} phone 
   * @returns {boolean} Is valid
   */
  isValidPhoneNumber: (phone) => {
    const formatted = paymentService.formatPhoneNumber(phone);
    return /^254[0-9]{9}$/.test(formatted);
  },

  /**
   * Format currency for display
   * @param {number} amount 
   * @returns {string} Formatted amount
   */
  formatCurrency: (amount) => {
    return `KES ${amount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  /**
   * Get payment method display name
   * @param {string} method 
   * @returns {string} Display name
   */
  getPaymentMethodName: (method) => {
    const names = {
      'mpesa_stk': 'M-Pesa (STK Push)',
      'mpesa_manual': 'M-Pesa (Manual)',
      'card': 'Credit/Debit Card',
      'bank_transfer': 'Bank Transfer',
      'cash': 'Cash on Delivery'
    };
    return names[method] || method;
  }
};

export default paymentService;
