import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bike, AlertTriangle, CheckCircle, XCircle, Pause, Play,
  Clock, Search, Eye, Edit3, Plus, ArrowRight, MapPin, DollarSign
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', color: 'yellow', icon: AlertTriangle },
  approved: { label: 'Active', color: 'green', icon: CheckCircle },
  paused: { label: 'Paused', color: 'orange', icon: Pause },
  rejected: { label: 'Rejected', color: 'red', icon: XCircle },
};

const MyBikeListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await bikeService.getMyListings();
      setListings(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(l =>
    !searchQuery ||
    l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.listing_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'gray', icon: Bike };
    return config;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>My Bike Listings | Oshocks</title></Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bike Listings</h1>
            <p className="text-gray-600">Manage your bikes listed for rent</p>
          </div>
          <button
            onClick={() => navigate('/bikes/list')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            List a Bike
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No listings yet</p>
            <button
              onClick={() => navigate('/bikes/list')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              List Your First Bike
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredListings.map((listing) => {
              const status = getStatusBadge(listing.listing_status);
              return (
                <div
                  key={listing.listing_code}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={listing.photos?.[0] || '/placeholder-bike.jpg'}
                      alt={listing.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{listing.name}</h3>
                        <span className={`px-2 py-0.5 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{listing.listing_code}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location_address}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          KSh {Number(listing.daily_rate).toLocaleString()}/day
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {listing.active_bookings_count || 0} active bookings
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/bikes/${listing.listing_code}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => navigate(`/bikes/${listing.listing_code}/edit`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>
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

export default MyBikeListingsPage;
