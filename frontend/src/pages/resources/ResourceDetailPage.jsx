import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Package, Calendar, Users, DollarSign, AlertTriangle, CheckCircle,
  Shield, Clock, Minus, Plus, ChevronLeft, Loader, Star, MapPin,
  Wrench, Info, X
} from 'lucide-react';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';

const ResourceDetailPage = () => {
  const { resourceCode } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [resourceCode]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getResource(resourceCode);
      setResource(response.data?.data);
    } catch (err) {
      toast.error('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select dates');
      return;
    }
    try {
      setCheckingAvailability(true);
      const response = await resourceService.checkAvailability(resourceCode, startDate, endDate, quantity);
      setAvailability(response.data?.data);
      if (response.data?.data?.available) {
        toast.success(`${response.data?.data?.available_quantity} available for selected dates`);
      } else {
        toast.error(response.data?.data?.reason || 'Not available');
      }
    } catch (err) {
      toast.error('Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resources/${resourceCode}` } });
      return;
    }
    if (!availability?.available) {
      toast.error('Please check availability first');
      return;
    }

    try {
      setBookingLoading(true);
      const response = await resourceService.createBooking({
        resource_code: resourceCode,
        start_datetime: startDate,
        end_datetime: endDate,
        quantity: quantity,
        payment_method: paymentMethod,
      });

      toast.success('Booking created! Proceed to payment.');
      navigate(`/resource-bookings/${response.data?.data?.booking_code}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  if (!resource) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Resource not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>{resource.name} | Resource</title></Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={resource.images?.[0] || '/placeholder-resource.jpg'}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {resource.images?.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  resource.resource_type === 'asset' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                }`}>
                  {resource.resource_type === 'asset' ? 'Physical Equipment' : 'Service / Add-on'}
                </span>
                {resource.is_low_stock && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {resource.remaining_alert}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{resource.name}</h1>
              <p className="text-gray-600 mt-2">{resource.description}</p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{resource.formatted_price}</span>
                {resource.surge_multiplier > 1.0 && (
                  <span className="text-sm text-orange-600 font-medium">
                    Surge: {resource.surge_multiplier}x
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">Base: {resource.formatted_base_price}</p>
              {resource.dynamic_pricing_enabled && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Dynamic pricing active - price may change based on demand
                </p>
              )}
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Availability
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{resource.total_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Now:</span>
                  <span className={`font-medium ${resource.available_quantity <= 0 ? 'text-red-600' : resource.is_low_stock ? 'text-orange-600' : 'text-green-600'}`}>
                    {resource.available_quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserved:</span>
                  <span className="font-medium">{resource.reserved_quantity}</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book This Resource
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(resource.available_quantity, quantity + 1))}
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                      Max: {resource.available_quantity}
                    </span>
                  </div>
                </div>

                <button
                  onClick={checkAvailability}
                  disabled={checkingAvailability || !startDate || !endDate}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {checkingAvailability ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Checking...
                    </span>
                  ) : (
                    'Check Availability'
                  )}
                </button>

                {availability && (
                  <div className={`p-4 rounded-xl ${availability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {availability.available ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                      <span className={availability.available ? 'text-green-700' : 'text-red-700'}>
                        {availability.available ? `${availability.available_quantity} available` : availability.reason}
                      </span>
                    </div>
                    {availability.pricing && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Estimated total: <strong>KSh {Number(availability.pricing.total).toLocaleString()}</strong></p>
                        {availability.pricing.rules_applied?.length > 0 && (
                          <p className="text-orange-600 text-xs mt-1">
                            Surge pricing applied: {availability.pricing.rules_applied.map(r => r.rule_type).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {availability?.available && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['mpesa', 'card', 'cod'].map((method) => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 px-4 rounded-lg border-2 font-medium text-sm capitalize transition-colors ${
                              paymentMethod === method
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {method === 'mpesa' ? 'M-Pesa' : method === 'card' ? 'Card' : 'COD'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                    >
                      Proceed to Book
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Booking</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Resource:</span>
                <span className="font-medium">{resource.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium uppercase">{paymentMethod}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">KSh {Number(availability?.pricing?.total * 1.15).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={bookingLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Confirm & Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;
