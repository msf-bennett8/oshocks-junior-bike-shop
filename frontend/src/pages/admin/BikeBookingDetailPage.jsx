import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bike, ArrowLeft, Calendar, Clock, MapPin, DollarSign, Shield,
  CheckCircle, XCircle, RotateCcw, AlertTriangle, User, Phone,
  Mail, CreditCard, Building2, Check, Ban, Wallet,
  FileText, History, Loader, Copy, Check as CheckIcon
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ModerationActionModal from '../../components/common/ModerationActionModal';
import { useToast } from '../../components/common/ToastContainer';

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: 'yellow', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle },
  active: { label: 'Active', color: 'indigo', icon: Bike },
  returned: { label: 'Returned', color: 'orange', icon: RotateCcw },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'red', icon: XCircle },
  disputed: { label: 'Disputed', color: 'red', icon: AlertTriangle },
};

const BikeBookingDetailPage = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [payoutRecord, setPayoutRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'confirm', title: '', message: '', onConfirm: null });

  // Delay notes modal state
  const [delayNotesModalOpen, setDelayNotesModalOpen] = useState(false);
  const [delayNotes, setDelayNotes] = useState('');

  // Payout form state
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ method: 'mpesa', reference: '', notes: '' });

  // Fine form state
  const [showFineForm, setShowFineForm] = useState(false);
  const [fineAmount, setFineAmount] = useState('');

  // Copy feedback
  const [copiedField, setCopiedField] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchBooking();
  }, [bookingCode]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bikeService.getBooking(bookingCode);
      const bookingData = response.data?.data || null;
      setBooking(bookingData);
      setError(null);

      if (bookingData?.id) {
        fetchPayoutRecord(bookingData.id);
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutRecord = async (bookingId) => {
    try {
      const response = await api.get(`/admin/bike-bookings/payouts?booking_id=${bookingId}`);
      const payouts = response.data?.data || [];
      setPayoutRecord(payouts[0] || null);
    } catch (err) {
      setPayoutRecord(null);
    }
  };

  const openModal = (config) => { setModalConfig(config); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─── Admin Actions ───

  const handleRecirculate = () => {
    openModal({
      type: 'confirm',
      title: 'Recirculate Bike',
      message: 'Mark this bike as returned and make it available for rent again?',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await bikeService.recirculateBike(bookingCode);
          await fetchBooking();
          toast.success('Bike recirculated successfully');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to recirculate');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleRefundDeposit = () => {
    openModal({
      type: 'confirm',
      title: 'Refund Security Deposit',
      message: `Refund KSh ${Number(booking?.security_deposit).toLocaleString()} security deposit to renter?`,
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await bikeService.refundDeposit(bookingCode);
          await fetchBooking();
          toast.success('Security deposit refunded');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to refund deposit');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleApplyFine = async () => {
    if (!fineAmount || isNaN(fineAmount) || Number(fineAmount) <= 0) {
      toast.error('Please enter a valid fine amount');
      return;
    }
    try {
      setActionLoading(true);
      await bikeService.applyFine(bookingCode, Number(fineAmount));
      setShowFineForm(false);
      setFineAmount('');
      await fetchBooking();
      toast.success('Fine applied successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply fine');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFine = () => {
    openModal({
      type: 'confirm',
      title: 'Remove Fine',
      message: 'Remove the late return fine from this booking?',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await bikeService.removeFine(bookingCode);
          await fetchBooking();
          toast.success('Fine removed');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to remove fine');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // ─── Payout Actions ───

  const getOrCreatePayoutId = async () => {
    if (payoutRecord?.id) return payoutRecord.id;

    try {
      const response = await api.post(`/admin/bike-bookings/${bookingCode}/create-payout`);
      const newPayout = response.data?.data;
      setPayoutRecord(newPayout);
      return newPayout?.id;
    } catch (err) {
      console.error('Failed to create payout:', err);
      return null;
    }
  };

  const handleProcessPayout = async () => {
    if (!payoutForm.reference.trim()) {
      toast.error('Please enter a payout reference/transaction ID');
      return;
    }
    try {
      setActionLoading(true);
      const payoutId = await getOrCreatePayoutId();
      if (!payoutId) {
        toast.error('Failed to initialize payout record');
        return;
      }

      await api.post(`/admin/bike-bookings/payouts/${payoutId}/process`, {
        method: payoutForm.method,
        reference: payoutForm.reference,
      });

      setShowPayoutForm(false);
      setPayoutForm({ method: 'mpesa', reference: '', notes: '' });
      await fetchBooking();
      toast.success('Payout processed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelayPayout = () => {
    openModal({
      type: 'confirm',
      title: 'Delay Payout',
      message: 'Delay the lister payout for this booking? You will be asked for a reason next.',
      onConfirm: () => {
        closeModal();
        setDelayNotes('');
        setDelayNotesModalOpen(true);
      },
    });
  };

  const handleConfirmDelayPayout = async () => {
    if (!delayNotes.trim()) {
      toast.error('Delay reason is required');
      return;
    }
    setDelayNotesModalOpen(false);
    try {
      setActionLoading(true);
      const payoutId = await getOrCreatePayoutId();
      if (!payoutId) {
        toast.error('Failed to initialize payout record');
        setActionLoading(false);
        return;
      }

      await api.post(`/admin/bike-bookings/payouts/${payoutId}/delay`, { notes: delayNotes });
      setDelayNotes('');
      await fetchBooking();
      toast.success('Payout delayed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delay payout');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Status Update ───

  const handleStatusUpdate = (newStatus) => {
    const statusLabels = {
      confirmed: 'Confirm Booking',
      active: 'Mark as Active (Picked Up)',
      returned: 'Mark as Returned',
      completed: 'Mark as Completed',
      cancelled: 'Cancel Booking',
      disputed: 'Mark as Disputed',
    };
    openModal({
      type: 'confirm',
      title: statusLabels[newStatus],
      message: `Change booking status to "${newStatus}"?`,
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await bikeService.updateBookingStatus(bookingCode, newStatus);
          await fetchBooking();
          toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/admin/bike-booking-moderation')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Moderation
          </button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_payment;
  const isOverdue = booking.status === 'active' && new Date(booking.end_datetime) < new Date();
  const canRecirculate = booking.status === 'active' && new Date(booking.end_datetime) < new Date() && !booking.recirculated;
  const canRefundDeposit = (booking.status === 'returned' || booking.recirculated) && !booking.deposit_refunded && booking.security_deposit > 0;
  const canApplyFine = booking.status === 'active' && new Date(booking.end_datetime) < new Date() && !booking.late_return_fine;
  const canRemoveFine = booking.late_return_fine > 0;

  const payoutProcessed = payoutRecord?.status === 'paid';
  const payoutDelayed = payoutRecord?.status === 'delayed';
  const payoutMethod = payoutRecord?.payout_method;
  const payoutReference = payoutRecord?.payout_reference;
  const payoutProcessedAt = payoutRecord?.paid_at;
  const payoutDelayNotes = payoutRecord?.delay_notes;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Booking {booking.booking_code} | Admin | Oshocks</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/bike-booking-moderation')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Moderation
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking {booking.booking_code}</h1>
              <p className="text-gray-600 mt-1">
                {booking.bike?.name} • {booking.duration_type} rental • {booking.duration_days} days
              </p>
            </div>
            <span className={`px-3 py-1.5 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium flex items-center gap-1`}>
              <status.icon className="w-4 h-4" />
              {isOverdue ? 'Overdue' : status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ─── Main Content ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Booking Overview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Booking Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">{new Date(booking.start_datetime).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(booking.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">End Date</p>
                    <p className="font-semibold text-gray-900">{new Date(booking.end_datetime).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(booking.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">{booking.duration_days} days</p>
                    <p className="text-xs text-gray-400">{booking.duration_type}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">{booking.payment_method}</p>
                    <p className="text-xs text-gray-400">{booking.payment_status || 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Financial Breakdown
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Rental Fee</span>
                    <span className="font-medium">KSh {Number(booking.total_rental_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-medium">KSh {Number(booking.security_deposit).toLocaleString()}</span>
                  </div>
                  {booking.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">KSh {Number(booking.delivery_fee).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.insurance_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insurance</span>
                      <span className="font-medium">KSh {Number(booking.insurance_fee).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.add_ons_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-medium">KSh {Number(booking.add_ons_fee).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (15%)</span>
                    <span className="font-medium text-red-600">KSh {Number(booking.platform_fee).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span className="text-lg">KSh {Number(booking.grand_total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Lister Payout</span>
                    <span>KSh {Number(booking.owner_payout).toLocaleString()}</span>
                  </div>
                  {booking.late_return_fine > 0 && (
                    <div className="flex justify-between text-sm text-red-600 font-medium bg-red-50 p-2 rounded">
                      <span>Late Return Fine</span>
                      <span>KSh {Number(booking.late_return_fine).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.deposit_refunded && (
                    <div className="flex justify-between text-sm text-green-600 font-medium bg-green-50 p-2 rounded">
                      <span>Deposit Refunded</span>
                      <span>KSh {Number(booking.security_deposit).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  Status Timeline
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { label: 'Booking Created', date: booking.created_at, icon: FileText, color: 'gray' },
                    { label: 'Payment Due', date: booking.status === 'pending_payment' ? null : booking.created_at, icon: DollarSign, color: 'yellow' },
                    { label: 'Confirmed', date: ['confirmed', 'active', 'returned', 'completed'].includes(booking.status) ? booking.updated_at : null, icon: CheckCircle, color: 'blue' },
                    { label: 'Picked Up', date: booking.picked_up_at, icon: Bike, color: 'indigo' },
                    { label: 'Returned', date: booking.returned_at, icon: RotateCcw, color: 'orange' },
                    { label: 'Completed', date: booking.status === 'completed' ? booking.updated_at : null, icon: CheckCircle, color: 'green' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.date ? `bg-${step.color}-100` : 'bg-gray-100'}`}>
                        <step.icon className={`w-4 h-4 ${step.date ? `text-${step.color}-600` : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${step.date ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        {step.date && (
                          <p className="text-xs text-gray-500">{new Date(step.date).toLocaleString()}</p>
                        )}
                      </div>
                      {step.date && <CheckIcon className="w-4 h-4 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  Admin Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {booking.status === 'pending_payment' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" /> Confirm Booking
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('active')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50"
                    >
                      <Bike className="w-4 h-4 inline mr-1" /> Mark Picked Up
                    </button>
                  )}
                  {booking.status === 'active' && (
                    <button
                      onClick={() => handleStatusUpdate('returned')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-1" /> Mark Returned
                    </button>
                  )}
                  {booking.status === 'returned' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" /> Complete Booking
                    </button>
                  )}

                  {canRecirculate && (
                    <button
                      onClick={handleRecirculate}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-1" /> Return to Fleet
                    </button>
                  )}

                  {canRefundDeposit && (
                    <button
                      onClick={handleRefundDeposit}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                    >
                      <DollarSign className="w-4 h-4 inline mr-1" /> Refund Deposit
                    </button>
                  )}

                  {canApplyFine && (
                    <button
                      onClick={() => setShowFineForm(!showFineForm)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4 inline mr-1" /> Apply Fine
                    </button>
                  )}
                  {canRemoveFine && (
                    <button
                      onClick={handleRemoveFine}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4 inline mr-1" /> Remove Fine
                    </button>
                  )}

                  {['pending_payment', 'confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 inline mr-1" /> Cancel Booking
                    </button>
                  )}
                </div>

                {showFineForm && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-2">Apply Late Return Fine</p>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        placeholder="Amount in KSh"
                        className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={handleApplyFine}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setShowFineForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lister Payout Section */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  Lister Payout
                </h2>
              </div>
              <div className="p-6">
                {payoutProcessed ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Payout Processed</p>
                    </div>
                    <p className="text-sm text-green-700">
                      Amount: KSh {Number(payoutRecord?.net_payout || booking.owner_payout).toLocaleString()} •
                      Method: {payoutMethod} •
                      Ref: {payoutReference}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Processed on {payoutProcessedAt ? new Date(payoutProcessedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                ) : payoutDelayed ? (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <p className="font-semibold text-yellow-900">Payout Delayed</p>
                    </div>
                    <p className="text-sm text-yellow-700">{payoutDelayNotes || 'No notes provided'}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Lister is owed <span className="font-bold text-gray-900">KSh {Number(booking.owner_payout).toLocaleString()}</span>
                      {payoutRecord && (
                        <span className="block text-xs text-gray-400 mt-1">
                          Payout record #{payoutRecord.id} • {payoutRecord.status}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowPayoutForm(!showPayoutForm)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        <DollarSign className="w-4 h-4 inline mr-1" /> Process Payout
                      </button>
                      <button
                        onClick={handleDelayPayout}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 disabled:opacity-50"
                      >
                        <Clock className="w-4 h-4 inline mr-1" /> Delay Payout
                      </button>
                    </div>

                    {showPayoutForm && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900 mb-3">Process Payout</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Payout Method</label>
                            <select
                              value={payoutForm.method}
                              onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                              className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            >
                              <option value="mpesa">M-Pesa</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Reference *</label>
                            <input
                              type="text"
                              value={payoutForm.reference}
                              onChange={(e) => setPayoutForm({ ...payoutForm, reference: e.target.value })}
                              placeholder="e.g., MPESA-REF-20251107"
                              className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea
                              value={payoutForm.notes}
                              onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                              placeholder="Add any notes..."
                              className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleProcessPayout}
                              disabled={actionLoading}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading ? 'Processing...' : 'Confirm Payout'}
                            </button>
                            <button
                              onClick={() => setShowPayoutForm(false)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-6">

            {/* Bike Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bike className="w-5 h-5 text-orange-500" />
                Bike Details
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={booking.bike?.photos?.[0] || '/placeholder-bike.jpg'}
                  alt={booking.bike?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{booking.bike?.name}</p>
                  <p className="text-xs text-gray-500">{booking.bike?.listing_code}</p>
                  <p className="text-xs text-gray-500">KSh {Number(booking.bike?.daily_rate).toLocaleString()}/day</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.bike?.location_address || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{booking.bike?.category || 'Bike'}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/bikes/${booking.bike?.listing_code}`)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                View Bike Listing
              </button>
            </div>

            {/* Renter Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Renter
              </h3>
              <div className="flex items-center gap-3 mb-3">
                {booking.renter?.avatar ? (
                  <img src={booking.renter.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {(booking.renter?.name || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{booking.renter?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{booking.renter?.email}</p>
                </div>
              </div>
              {booking.renter?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{booking.renter.phone}</span>
                  <button
                    onClick={() => handleCopy(booking.renter.phone, 'renter-phone')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedField === 'renter-phone' ? <CheckIcon className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Owner/Lister Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                Lister (Owner)
              </h3>
              <div className="flex items-center gap-3 mb-3">
                {booking.owner?.avatar ? (
                  <img src={booking.owner.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    {(booking.owner?.name || 'O').charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{booking.owner?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{booking.owner?.email}</p>
                </div>
              </div>
              {booking.owner?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{booking.owner.phone}</span>
                  <button
                    onClick={() => handleCopy(booking.owner.phone, 'owner-phone')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedField === 'owner-phone' ? <CheckIcon className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono text-gray-700">{booking.booking_code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-700">{new Date(booking.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deposit</span>
                  <span className="font-medium">KSh {Number(booking.security_deposit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission</span>
                  <span className="font-medium text-red-600">KSh {Number(booking.platform_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-700">Lister Gets</span>
                  <span className="text-green-600">KSh {Number(booking.owner_payout).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModerationActionModal
        isOpen={modalOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        isLoading={actionLoading}
      />

      {/* Delay Notes Modal */}
      <ModerationActionModal
        isOpen={delayNotesModalOpen}
        onClose={() => setDelayNotesModalOpen(false)}
        type="confirm"
        title="Delay Reason"
        message="Please provide a reason for delaying this payout. This will be visible to the lister."
        confirmText="Confirm Delay"
        cancelText="Cancel"
        onConfirm={handleConfirmDelayPayout}
        onCancel={() => setDelayNotesModalOpen(false)}
        isLoading={actionLoading}
      >
        <div className="mt-2">
          <textarea
            value={delayNotes}
            onChange={(e) => setDelayNotes(e.target.value)}
            placeholder="Enter delay reason..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 min-h-[80px]"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">
            {delayNotes.length}/500 characters
          </p>
        </div>
      </ModerationActionModal>
    </div>
  );
};

export default BikeBookingDetailPage;