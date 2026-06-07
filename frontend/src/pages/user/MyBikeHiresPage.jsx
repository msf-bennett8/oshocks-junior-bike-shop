import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bike, CheckCircle, Clock, XCircle, Calendar, MapPin,
  DollarSign, Search, Eye, ArrowRight, AlertTriangle, Ticket
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import { useAuth } from '../../context/AuthContext';
import BikeRentalTicketModal from '../bikes/BikeRentalTicketModal';

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: 'yellow', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'green', icon: CheckCircle },
  active: { label: 'Active', color: 'blue', icon: Bike },
  returned: { label: 'Returned — Awaiting Inspection', color: 'orange', icon: Clock },
  completed: { label: 'Completed', color: 'emerald', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'red', icon: XCircle },
  disputed: { label: 'Disputed', color: 'red', icon: AlertTriangle },
  refunded: { label: 'Refunded', color: 'gray', icon: XCircle },
};

const MyBikeHiresPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedBookingCode, setSelectedBookingCode] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bikeService.getMyBookings();
      const data = response.data?.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b =>
    !searchQuery ||
    b.bike?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.booking_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'gray', icon: Bike };
    return config;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>My Bike Hires | Oshocks</title></Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bike Hires</h1>
          <p className="text-gray-600">Track your bike rental bookings</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your hires..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hires yet</p>
            <button
              onClick={() => navigate('/bikes')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Bikes for Rent
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => {
              const status = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.booking_code}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.bike?.photos?.[0] || '/placeholder-bike.jpg'}
                      alt={booking.bike?.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{booking.bike?.name}</h3>
                        <span className={`px-2 py-0.5 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{booking.booking_code}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.start_datetime).toLocaleDateString()} → {new Date(booking.end_datetime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          KSh {Number(booking.grand_total).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.bike?.owner_name || booking.bike?.owner?.name || 'Unknown'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBookingCode(booking.booking_code);
                          setTicketModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
                      >
                        <Ticket className="w-3 h-3" /> View Ticket
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BikeRentalTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        bookingCode={selectedBookingCode}
      />
    </div>
  );
};

export default MyBikeHiresPage;