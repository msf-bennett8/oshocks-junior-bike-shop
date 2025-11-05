import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, DollarSign, Clock, AlertCircle, Loader, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recorderService from '../../services/recorder/recorderService';

const RecorderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPending: 0,
    totalAmount: 0
  });

  useEffect(() => {
    // Check if user has permission
    if (!user?.canRecordPayments && user?.role !== 'delivery_agent' && user?.role !== 'shop_attendant') {
      navigate('/unauthorized');
      return;
    }
    
    loadPendingOrders();
  }, [user, navigate]);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await recorderService.getPendingOrders();
      
      if (response.success) {
        const orders = response.data.data || [];
        setPendingOrders(orders);
        
        // Calculate stats
        const total = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        setStats({
          totalPending: orders.length,
          totalAmount: total
        });
      }
    } catch (err) {
      setError('Failed to load pending orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter an order number');
      return;
    }

    try {
      setSearching(true);
      setError('');
      
      const response = await recorderService.searchOrder(searchQuery.trim());
      
      if (response.success) {
        // Navigate to order details
        navigate(`/recorder/order/${searchQuery.trim()}`);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Order not found. Please check the order number.');
      } else {
        setError(err.response?.data?.message || 'Search failed. Please try again.');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleOrderClick = (orderNumber) => {
    navigate(`/recorder/order/${orderNumber}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Recorder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {user?.name} ({user?.role?.replace('_', ' ')})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Order</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="Enter order number (e.g., OS12345678)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Search
            </button>
          </form>
          
          {error && (
            <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Pending COD Payments</h2>
            <p className="text-sm text-gray-600 mt-1">Orders awaiting payment collection</p>
          </div>

          <div className="divide-y">
            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending orders</p>
                <p className="text-gray-400 text-sm mt-2">All orders have been processed</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.order_number)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {order.order_number}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Pending Payment
                        </span>
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-1">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {order.delivery_zone}, {order.address?.county}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleString('en-KE', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        KES {parseFloat(order.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecorderDashboard;