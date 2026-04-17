import api from './api';

const exportService = {
  /**
   * Export payouts to CSV/JSON (client-side generation)
   * @param {string} type - 'pending' | 'history' | 'payments'
   * @param {Array} data - Data to export
   * @param {string} format - 'csv' | 'json'
   * @param {Object} options - Additional options
   */
  exportPayouts: (type, data, format = 'csv', options = {}) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `payouts-${type}-${timestamp}.${format}`;
    
    if (format === 'csv') {
      const { exportToCSV, PAYOUT_EXPORT_COLUMNS } = require('../utils/exportUtils');
      const columns = PAYOUT_EXPORT_COLUMNS[type] || PAYOUT_EXPORT_COLUMNS.history;
      exportToCSV(data, columns, filename);
    } else if (format === 'json') {
      const { exportToJSON } = require('../utils/exportUtils');
      exportToJSON(data, filename);
    }
  },

  /**
   * Export single payout details with all payments
   * @param {Object} payout - Payout data
   * @param {Array} payments - Associated payments
   * @param {string} format - 'csv' | 'json'
   */
  exportPayoutDetails: (payout, payments, format = 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `payout-${payout.id}-details-${timestamp}.${format}`;
    
    const data = payments.map(p => ({
      payout_id: payout.id,
      seller_name: payout.seller_name,
      payout_date: payout.processed_at,
      ...p
    }));
    
    if (format === 'csv') {
      const { exportToCSV, PAYOUT_EXPORT_COLUMNS } = require('../utils/exportUtils');
      exportToCSV(data, PAYOUT_EXPORT_COLUMNS.payments, filename);
    } else {
      const { exportToJSON } = require('../utils/exportUtils');
      exportToJSON(data, filename);
    }
  },

  /**
   * Server-side export (if you want backend generation)
   * @param {Object} filters - Export filters
   */
  serverExport: async (filters = {}) => {
    const response = await api.get('/payouts/export', {
      params: filters,
      responseType: 'blob'
    });
    return response;
  }
};

export default exportService;
