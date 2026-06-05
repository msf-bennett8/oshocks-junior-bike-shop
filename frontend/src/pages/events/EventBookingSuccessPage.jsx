import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Calendar, MapPin, Ticket, ArrowRight } from 'lucide-react';
import eventService from '../../services/eventService';

const EventBookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const registrationCode = searchParams.get('registration');
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Verify payment status
    if (reference) {
      eventService.verifyEventCardPayment(reference).catch(console.error);
    }
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Helmet><title>Booking Confirmed | Oshocks</title></Helmet>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your event registration has been successfully confirmed.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <Ticket className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Registration Code</p>
              <p className="font-bold text-gray-900">{registrationCode || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Payment Reference</p>
              <p className="font-bold text-gray-900">{reference || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-event-bookings')}
            className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/events')}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventBookingSuccessPage;
