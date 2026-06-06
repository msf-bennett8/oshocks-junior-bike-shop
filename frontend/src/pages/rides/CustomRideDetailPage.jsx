import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bike, ArrowLeft, Calendar, Users, MapPin, Clock, AlertTriangle,
  DollarSign, CheckCircle, XCircle, RefreshCw, Phone, Mail, MessageSquare
} from 'lucide-react';
import { useCustomRides } from '../../hooks/useCustomRides';
import customRideService from '../../services/customRideService';

const STATUS_CONFIG = {
  reviewing: { label: 'Pending Review', color: 'yellow', icon: AlertTriangle },
  quoted: { label: 'Quoted', color: 'blue', icon: DollarSign },
  accepted: { label: 'Accepted', color: 'green', icon: CheckCircle },
  converted: { label: 'Converted to Event', color: 'purple', icon: RefreshCw },
  scheduled: { label: 'Scheduled', color: 'indigo', icon: Calendar },
  completed: { label: 'Completed', color: 'emerald', icon: CheckCircle },
  declined: { label: 'Declined', color: 'red', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'gray', icon: XCircle },
};

const CustomRideDetailPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await customRideService.getRequest(requestId);
      setRequest(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    const cancellableStatuses = ['reviewing', 'quoted'];
    if (!cancellableStatuses.includes(request?.status)) {
      alert('This request cannot be cancelled at this stage.');
      return;
    }

    setCancelling(true);
    try {
      await customRideService.updateStatus(request.request_id, 'cancelled', 'Cancelled by user');
      setRequest(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading request...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error || 'Request not found'}</p>
          <button
            onClick={() => navigate('/my-rides')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to My Rides
          </button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.reviewing;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>{request.title} | My Custom Rides | Oshocks</title></Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate('/my-rides')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Rides
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Status Banner */}
          <div className={`bg-${status.color}-50 border-b border-${status.color}-100 px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <status.icon className={`w-5 h-5 text-${status.color}-600`} />
                <div>
                  <p className={`text-sm font-semibold text-${status.color}-700`}>{status.label}</p>
                  <p className="text-xs text-gray-500">Request ID: {request.request_id}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title & Description */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
              <p className="text-gray-600 leading-relaxed">{request.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Date</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {new Date(request.preferred_date).toLocaleDateString()}
                </p>
                {request.date_flexible && (
                  <p className="text-xs text-gray-500">±{request.date_flexibility_days} days flexible</p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Group Size</span>
                </div>
                <p className="font-semibold text-gray-900">{request.rider_count || request.group_size} riders</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Distance</span>
                </div>
                <p className="font-semibold text-gray-900">{request.distance_km} km</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Duration</span>
                </div>
                <p className="font-semibold text-gray-900">{request.duration_hours} hours</p>
              </div>
            </div>

            {/* Bike & Add-ons */}
            {request.bike_model && (
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Bike className="w-4 h-4 text-orange-600" />
                  Bike Rental
                </h3>
                <p className="text-sm text-gray-700">{request.bike_model} {request.bike_size && `(Size: ${request.bike_size.toUpperCase()})`}</p>
                {request.add_ons?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {request.add_ons.map(addon => (
                      <span key={addon} className="px-2 py-1 bg-white text-orange-700 text-xs rounded-full font-medium">
                        +{addon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pricing */}
            {request.total_price > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rental</span>
                    <span className="font-medium">KSh {Number(request.base_rental_price).toLocaleString()}</span>
                  </div>
                  {request.add_ons_price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-medium">KSh {Number(request.add_ons_price).toLocaleString()}</span>
                    </div>
                  )}
                  {request.insurance_price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance</span>
                      <span className="font-medium">KSh {Number(request.insurance_price).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-orange-600">KSh {Number(request.total_price).toLocaleString()}</span>
                  </div>
                  {request.security_deposit > 0 && (
                    <p className="text-xs text-gray-500">Security deposit: KSh {Number(request.security_deposit).toLocaleString()} (refundable)</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{request.contact_phone}</span>
                </div>
                {request.guest_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{request.guest_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Notes */}
            {request.staff_notes && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Staff Notes
                </h3>
                <p className="text-sm text-gray-700">{request.staff_notes}</p>
              </div>
            )}

            {/* Converted Event Link */}
            {request.converted_event_code && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-purple-700 font-medium">
                  This request has been converted to an event.
                </p>
                <Link
                  to={`/events/${request.converted_event_code}`}
                  className="text-sm text-purple-600 hover:text-purple-800 font-semibold mt-1 inline-block"
                >
                  View Event →
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {['reviewing', 'quoted'].includes(request.status) && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-6 py-2.5 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {cancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
              )}

              {request.status === 'quoted' && (
                <button
                  onClick={() => alert('Accept functionality coming soon')}
                  className="px-6 py-2.5 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Quote
                </button>
              )}

              <button
                onClick={() => navigate('/ride-request')}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors ml-auto"
              >
                Request Another Ride
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRideDetailPage;
