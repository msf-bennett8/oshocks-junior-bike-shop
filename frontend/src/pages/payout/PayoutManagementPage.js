import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import payoutService from '../../services/payoutService';
import { 
  DollarSign, Users, Clock, CheckCircle, AlertCircle, 
  RefreshCw, Search, Filter, Download, Eye, 
  CreditCard, Building2, TrendingUp, Calendar
} from 'lucide-react';

const PayoutManagementPage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSellerDetails, setSelectedSellerDetails] = useState(null);
  const { user } = useAuth();

  // Pending payouts data
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [pendingSummary, setPendingSummary] = useState({
    total_sellers: 0,
    total_payout_amount: 0,
    currency: 'KES'
  });

  // History data
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    current_page: 1,
    total_pages: 1,
    per_page: 20,
    total: 0
  });

  // Process payout form
  const [payoutForm, setPayoutForm] = useState({
    payout_method: 'mpesa',
    payout_reference: '',
    notes: ''
  });

  // Fetch pending payouts
  const fetchPendingPayouts = async () => {
    setIsLoading(true);
    try {
      const response = await payoutService.getPendingPayouts();
      if (response.success) {
        setPendingPayouts(response.data || []);
        setPendingSummary(response.summary || {
          total_sellers: 0,
          total_payout_amount: 0,
          currency: 'KES'
        });
      }
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payout history
  const fetchPayoutHistory = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await payoutService.getPayoutHistory({
        page,
        per_page: 20
      });
      if (response.success) {
        setPayoutHistory(response.data || []);
        setHistoryPagination(response.pagination || {
          current_page: 1,
          total_pages: 1,
          per_page: 20,
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching payout history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingPayouts();
    } else {
      fetchPayoutHistory();
    }
  }, [activeTab]);

  // Handle seller selection
  const handleSelectSeller = (sellerId) => {
    if (selectedSellers.includes(sellerId)) {
      setSelectedSellers(selectedSellers.filter(id => id !== sellerId));
    } else {
      setSelectedSellers([...selectedSellers, sellerId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedSellers.length === filteredPendingPayouts.length) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(filteredPendingPayouts.map(p => p.seller_id));
    }
  };

  // View seller payment details
  const viewSellerDetails = async (seller) => {
    try {
      const response = await payoutService.getSellerPendingPayments(seller.seller_id);
      if (response.success) {
        setSelectedSellerDetails({
          seller,
          payments: response.data,
          summary: response.summary
        });
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
      alert('Failed to load seller payment details');
    }
  };

  // Process payouts
  const handleProcessPayouts = async (e) => {
    e.preventDefault();
    
    if (selectedSellers.length === 0) {
      alert('Please select at least one seller');
      return;
    }

    if (!payoutForm.payout_reference.trim()) {
      alert('Please enter a payout reference');
      return;
    }

    if (!window.confirm(`Process payouts for ${selectedSellers.length} seller(s)?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await payoutService.processPayouts({
        seller_ids: selectedSellers,
        payout_method: payoutForm.payout_method,
        payout_reference: payoutForm.payout_reference,
        notes: payoutForm.notes
      });

      if (response.success) {
        alert(`✅ Successfully processed ${response.data.length} payout(s)`);
        setShowProcessModal(false);
        setSelectedSellers([]);
        setPayoutForm({
          payout_method: 'mpesa',
          payout_reference: '',
          notes: ''
        });
        fetchPendingPayouts();
      }
    } catch (error) {
      console.error('Error processing payouts:', error);
      alert('❌ Failed to process payouts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter pending payouts by search
  const filteredPendingPayouts = pendingPayouts.filter(payout =>
    payout.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.seller_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${Number(amount).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payout Management
          </h1>
          <p className="text-gray-600">
            Process seller payouts and view payment history
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => activeTab === 'pending' ? fetchPendingPayouts() : fetchPayoutHistory()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {activeTab === 'pending' && selectedSellers.length > 0 && (
            <button
              onClick={() => setShowProcessModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle size={18} />
              Process {selectedSellers.length} Payout{selectedSellers.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Sellers Pending</p>
                <p className="text-3xl font-bold">{pendingSummary.total_sellers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Total Pending</p>
                <p className="text-3xl font-bold">{formatCurrency(pendingSummary.total_payout_amount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Selected</p>
                <p className="text-3xl font-bold">{selectedSellers.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={18} />
                Pending Payouts
                {pendingSummary.total_sellers > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {pendingSummary.total_sellers}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                Payout History
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Pending Payouts Tab */}
          {activeTab === 'pending' && (
            <div>
              {/* Search and Actions */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search sellers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {filteredPendingPayouts.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {selectedSellers.length === filteredPendingPayouts.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Pending Payouts Table */}
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                  <p className="text-gray-600">Loading pending payouts...</p>
                </div>
              ) : filteredPendingPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Payouts</h3>
                  <p className="text-gray-600">All sellers have been paid up to date!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3 pr-4">
                          <input
                            type="checkbox"
                            checked={selectedSellers.length === filteredPendingPayouts.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Seller</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Transactions</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Total Sales</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Commission</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Payout Amount</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Period</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Payment Method</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredPendingPayouts.map((payout) => (
                        <tr key={payout.seller_id} className="hover:bg-gray-50">
                          <td className="py-4 pr-4">
                            <input
                              type="checkbox"
                              checked={selectedSellers.includes(payout.seller_id)}
                              onChange={() => handleSelectSeller(payout.seller_id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{payout.seller_name}</p>
                              <p className="text-xs text-gray-500">{payout.seller_email}</p>
                              {payout.seller_phone && (
                                <p className="text-xs text-gray-500">{payout.seller_phone}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-sm font-medium text-gray-900">{payout.transaction_count}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(payout.total_sales)}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm text-red-600">{formatCurrency(payout.total_commission)}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-bold text-green-600">{formatCurrency(payout.payout_amount)}</span>
                          </td>
                          <td className="py-4 text-center">
                            <div className="text-xs text-gray-600">
                              <p>{formatDate(payout.period.from)}</p>
                              <p>to {formatDate(payout.period.to)}</p>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {payout.payment_method === 'mpesa' ? (
                                <CreditCard size={16} className="text-green-600" />
                              ) : (
                                <Building2 size={16} className="text-blue-600" />
                              )}
                              <span className="text-xs text-gray-700">{payout.payment_method || 'N/A'}</span>
                            </div>
                            {payout.payment_account && (
                              <p className="text-xs text-gray-500 mt-1">{payout.payment_account}</p>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => viewSellerDetails(payout)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payout History Tab */}
          {activeTab === 'history' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                  <p className="text-gray-600">Loading payout history...</p>
                </div>
              ) : payoutHistory.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payout History</h3>
                  <p className="text-gray-600">No payouts have been processed yet.</p>
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Payout ID</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Seller</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Amount</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Method</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Reference</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Processed By</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payoutHistory.map((payout) => (
                          <tr key={payout.id} className="hover:bg-gray-50">
                            <td className="py-4">
                              <span className="text-sm font-mono text-gray-900">#{payout.id}</span>
                            </td>
                            <td className="py-4">
                              <p className="text-sm font-medium text-gray-900">{payout.seller_name}</p>
                            </td>
                            <td className="py-4 text-right">
                              <span className="text-sm font-semibold text-green-600">{formatCurrency(payout.payout_amount)}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {payout.payout_method === 'mpesa' ? (
                                  <CreditCard size={14} className="text-green-600" />
                                ) : (
                                  <Building2 size={14} className="text-blue-600" />
                                )}
                                {payout.payout_method}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="text-sm font-mono text-gray-700">{payout.payout_reference}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-sm text-gray-700">{payout.processed_by_name}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-sm text-gray-700">
                                {new Date(payout.processed_at).toLocaleString('en-GB', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyPagination.total_pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        Showing page {historyPagination.current_page} of {historyPagination.total_pages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchPayoutHistory(historyPagination.current_page - 1)}
                          disabled={historyPagination.current_page === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchPayoutHistory(historyPagination.current_page + 1)}
                          disabled={historyPagination.current_page === historyPagination.total_pages}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Process Payout Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Process Payouts</h2>
              <p className="text-sm text-gray-600 mt-1">
                Processing payouts for {selectedSellers.length} seller(s)
              </p>
            </div>

            <form onSubmit={handleProcessPayouts} className="p-6 space-y-4">
              {/* Payout Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Method *
                </label>
                <select
                  value={payoutForm.payout_method}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payout_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Payout Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Reference/Transaction ID *
                </label>
                <input
                  type="text"
                  value={payoutForm.payout_reference}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payout_reference: e.target.value })}
                  placeholder="e.g., MPESA-REF-20251107"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the transaction reference from your payment system
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Payout Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected Sellers:</span>
                  <span className="font-semibold">{selectedSellers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(
                      pendingPayouts
                        .filter(p => selectedSellers.includes(p.seller_id))
                        .reduce((sum, p) => sum + Number(p.payout_amount), 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Process Payouts
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {showDetailsModal && selectedSellerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSellerDetails.seller.seller_name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSellerDetails.seller.seller_email}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false
                    )}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Transactions</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {selectedSellerDetails.summary.transaction_count}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(selectedSellerDetails.summary.total_sales)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-red-600 font-medium mb-1">Commission</p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(selectedSellerDetails.summary.total_commission)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-medium mb-1">Payout Amount</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(selectedSellerDetails.summary.payout_amount)}
                  </p>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="text-sm font-semibold text-gray-900">Payment Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSellerDetails.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-900">
                              {payment.transaction_reference}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-700">
                              {payment.order?.order_number || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                              {payment.payment_method}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-red-600">
                              -{formatCurrency(payment.platform_commission_amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(payment.seller_payout_amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-gray-600">
                              {new Date(payment.payment_collected_at).toLocaleDateString('en-GB')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recorded By Info */}
              {selectedSellerDetails.payments.length > 0 && selectedSellerDetails.payments[0].recordedBy && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Recorded by: <span className="font-medium text-gray-900">
                      {selectedSellerDetails.payments[0].recordedBy.name}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutManagementPage;
