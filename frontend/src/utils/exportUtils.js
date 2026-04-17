/**
 * Export Utilities for CSV, JSON, and other formats
 */

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with { key, label, formatter? }
 * @returns {string} CSV content
 */
export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';
  
  // Header row
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Data rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // Handle nested keys (e.g., 'order.order_number')
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], row);
      }
      
      // Apply formatter if provided
      if (col.formatter) {
        value = col.formatter(value, row);
      }
      
      // Escape quotes and wrap in quotes
      const stringValue = value === null || value === undefined ? '' : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Download data as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType = 'text/csv') => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, columns, filename) => {
  const csv = convertToCSV(data, columns);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export data to JSON
 * @param {Array} data - Data to export
 * @param {string} filename - Output filename
 */
export const exportToJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err2) {
      console.error('Fallback copy failed:', err2);
      return false;
    }
  }
};

/**
 * Format currency for export
 * @param {number} amount - Amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatCurrencyForExport = (amount, currency = 'KES') => {
  if (amount === null || amount === undefined) return '';
  return `${currency} ${Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format date for export
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDateForExport = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB');
};

// Payout export column definitions
export const PAYOUT_EXPORT_COLUMNS = {
  pending: [
    { key: 'seller_id', label: 'Seller ID' },
    { key: 'seller_name', label: 'Seller Name' },
    { key: 'seller_email', label: 'Seller Email' },
    { key: 'seller_phone', label: 'Seller Phone' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'transaction_count', label: 'Transaction Count' },
    { key: 'total_sales', label: 'Total Sales', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'total_commission', label: 'Commission', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'payout_amount', label: 'Payout Amount', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'period.from', label: 'Period From' },
    { key: 'period.to', label: 'Period To' },
  ],
  history: [
    { key: 'id', label: 'Payout ID' },
    { key: 'seller_name', label: 'Seller Name' },
    { key: 'payout_amount', label: 'Payout Amount', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'payout_method', label: 'Payment Method' },
    { key: 'payout_reference', label: 'Reference' },
    { key: 'processed_by_name', label: 'Processed By' },
    { key: 'processed_at', label: 'Processed At', formatter: (v) => formatDateForExport(v) },
    { key: 'notes', label: 'Notes' },
  ],
  payments: [
    { key: 'id', label: 'Payment ID' },
    { key: 'transaction_reference', label: 'Transaction Reference' },
    { key: 'purchase_id', label: 'Purchase ID' },
    { key: 'order.order_number', label: 'Order Number' },
    { key: 'order.order_display', label: 'Order Display' },
    { key: 'order.purchase_id', label: 'Purchase ID' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'amount', label: 'Amount', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'platform_commission_amount', label: 'Commission', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'seller_payout_amount', label: 'Net Amount', formatter: (v) => formatCurrencyForExport(v) },
    { key: 'payment_collected_at', label: 'Payment Date', formatter: (v) => formatDateForExport(v) },
  ]
};

export default {
  convertToCSV,
  downloadFile,
  exportToCSV,
  exportToJSON,
  copyToClipboard,
  formatCurrencyForExport,
  formatDateForExport,
  PAYOUT_EXPORT_COLUMNS
};
