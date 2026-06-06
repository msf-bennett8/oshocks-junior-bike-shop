import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bike, AlertTriangle, DollarSign, CheckCircle, XCircle, Calendar,
  Clock, RefreshCw, Search, Eye, ChevronRight, MapPin, Users
} from 'lucide-react';
import { useCustomRides } from '../../hooks/useCustomRides';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'all', label: 'All', icon: Bike },
  { key: 'reviewing', label: 'Pending', icon: AlertTriangle },
  { key: 'quoted', label: 'Quoted', icon: DollarSign },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'converted', label: 'Converted', icon: RefreshCw },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'declined', label: 'Declined', icon: XCircle },
];

const MyCustomRidesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { myRequests, loading, error, fetchMyRequests } = useCustomRides();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    fetchMyRequests(params);
  }, [activeTab]);

  const filteredRequests = myRequests.filter((req) => {
    if (activeTab !== 'all' && req.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        req.title?.toLowerCase().includes(q) ||
        req.request_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const map = {
      reviewing: { label: 'Pending Review', color: 'yellow', icon: AlertTriangle },
      quoted: { label: 'Quoted', color: 'blue', icon: DollarSign },
      accepted: { label: 'Accepted', color: 'green', icon: CheckCircle },
      converted: { label: 'Converted to Event', color: 'purple', icon: RefreshCw },
      scheduled: { label: 'Scheduled', color: 'purple', icon: Calendar },
      completed: { label: 'Completed', color: 'emerald', icon: CheckCircle },
      declined: { label: 'Declined', color: 'red', icon: XCircle },
      cancelled: { label: 'Cancelled', color: 'gray', icon: XCircle },
    };
    return map[status] || { label: status, color: 'gray', icon: Bike };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>My Custom Rides | Oshocks</title></Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Custom Ride Requests</h1>
          <p className="text-gray-600">Track your custom ride requests and their status.</p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => fetchMyRequests(activeTab !== 'all' ? { status: activeTab } : {})}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No requests found</p>
            <button
              onClick={() => navigate('/rides/request')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Request a Custom Ride
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              return (
                <div
                  key={request.request_id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/rides/${request.request_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img
                        src={request.images?.[0]?.secure_url || '/placeholder-bike.jpg'}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-xs text-gray-500">{request.request_id}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(request.preferred_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {request.rider_count || request.group_size} riders
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {request.distance_km}km
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 bg-${statusBadge.color}-100 text-${statusBadge.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                        <statusBadge.icon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                      {request.converted_event_code && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${request.converted_event_code}`);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                          View Event <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {request.total_price > 0 && (
                        <p className="text-sm font-semibold text-gray-900">
                          KSh {Number(request.total_price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCustomRidesPage;
