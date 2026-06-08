cat << 'EOF' > frontend/src/pages/resources/ResourceBookingSuccessPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle, Clock, Package, ArrowLeft, Loader, CreditCard,
  Smartphone, Truck, Download, Share2
} from 'lucide-react';
import resourceService from '../../services/resourceService';
import { useToast } from '../../components/common/ToastContainer';

const ResourceBookingSuccessPage = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    fetchBooking();
  }, [bookingCode]);

  const fetchBooking = async () => {
    try {
      const response = await resourceService.getBooking(bookingCode);
      setBooking(response.data?.data);
      setPaymentStatus(response.data?.data?.payment_status);
    } catch (err) {
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async () => {
    try {
      // Implement M-Pesa STK push
      toast.success('M-Pesa prompt sent to your phone');
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  const handleCardPayment = async () => {
    try {
      // Implement card payment
      toast.success('Redirecting to payment...');
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Booking not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Booking Confirmed | {booking.booking_code}</title></Helmet>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
            <p className="text-white/80 mt-2">Your resource has been reserved</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Booking Code */}
            <div className="text-center">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="text-2xl font-bold text-gray-900 tracking-wider">{booking.booking_code}</p>
            </div>

            {/* Resource Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <img
                  src={booking.resource_item?.images?.[0] || '/placeholder-resource.jpg'}
                  alt={booking.resource_item?.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.resource_item?.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {booking.quantity_booked}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.start_datetime).toLocaleDateString()} - {new Date(booking.end_datetime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>KSh {Number(booking.total_price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (15%):</span>
                <span>KSh {Number(booking.platform_fee).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>KSh {Number(booking.grand_total).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Section */}
            {booking.payment_status === 'pending' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Complete Payment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleMpesaPayment}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    <Smartphone className="w-5 h-5" />
                    M-Pesa
                  </button>
                  <button
                    onClick={handleCardPayment}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <CreditCard className="w-5 h-5" />
                    Card
                  </button>
                </div>
                {booking.payment_method === 'cod' && (
                  <p className="text-sm text-gray-500 text-center">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Cash on delivery selected
                  </p>
                )}
              </div>
            )}

            {booking.payment_status === 'paid' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Payment Completed</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/my-resource-bookings')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBookingSuccessPage;
