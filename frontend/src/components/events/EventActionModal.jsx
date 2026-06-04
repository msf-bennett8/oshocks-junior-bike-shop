import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, Copy, ClipboardCheck, ArrowLeft, Plus, X, 
  Bike, Calendar, MessageCircle, Ticket, Share2 
} from 'lucide-react';

/**
 * EventActionModal - Reusable success modal for all event-related actions
 * 
 * actionType options:
 * - 'event_created'     → Event creation success
 * - 'bike_listed'       → Bike listing success  
 * - 'event_booked'      → Event booking success
 * - 'bike_booked'       → Bike rental booking success
 * - 'ride_created'      → Ride request created
 * - 'community_shared'  → Community post shared
 */

const ACTION_CONFIG = {
  event_created: {
    icon: Calendar,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Event Created Successfully!',
    subtitle: 'Your cycling event is now live and ready for bookings.',
    codeLabel: 'Event Code',
    viewButtonText: 'View Event',
    viewButtonIcon: Calendar,
    createAnotherText: 'Create Another Event',
    createAnotherIcon: Plus,
  },
  bike_listed: {
    icon: Bike,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Bike Listed Successfully!',
    subtitle: 'Your bike is now available for rent. It will be reviewed within 24 hours.',
    codeLabel: 'Listing Code',
    viewButtonText: 'View Listing',
    viewButtonIcon: Bike,
    createAnotherText: 'List Another Bike',
    createAnotherIcon: Plus,
  },
  event_booked: {
    icon: Ticket,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Booking Confirmed!',
    subtitle: 'Your spot is reserved. Check your email for confirmation details.',
    codeLabel: 'Booking Reference',
    viewButtonText: 'View Booking',
    viewButtonIcon: Ticket,
    createAnotherText: 'Book Another Event',
    createAnotherIcon: Plus,
  },
  bike_booked: {
    icon: Bike,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Rental Confirmed!',
    subtitle: 'Your bike rental is confirmed. Pickup details sent to your email.',
    codeLabel: 'Rental Reference',
    viewButtonText: 'View Rental',
    viewButtonIcon: Bike,
    createAnotherText: 'Rent Another Bike',
    createAnotherIcon: Plus,
  },
  ride_created: {
    icon: Calendar,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    title: 'Ride Request Submitted!',
    subtitle: 'We will review your request and get back to you with a quote within 24 hours.',
    codeLabel: 'Request Code',
    viewButtonText: 'View Request',
    viewButtonIcon: Calendar,
    createAnotherText: 'Request Another Ride',
    createAnotherIcon: Plus,
  },
  community_shared: {
    icon: MessageCircle,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    title: 'Story Shared Successfully!',
    subtitle: 'Your ride story is now live in the community.',
    codeLabel: 'Post Code',
    viewButtonText: 'View Post',
    viewButtonIcon: MessageCircle,
    createAnotherText: 'Share Another Story',
    createAnotherIcon: Share2,
  },
};

const EventActionModal = ({ 
  actionType = 'event_created', 
  code, 
  onClose, 
  onCreateAnother,
  customMessage = null,
}) => {
  const [copied, setCopied] = useState(false);
  const config = ACTION_CONFIG[actionType] || ACTION_CONFIG.event_created;
  const Icon = config.icon;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-scaleIn">
        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">
            {config.title}
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            {customMessage || config.subtitle}
          </p>
        </div>

        {/* Code Display */}
        {code && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {config.codeLabel}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-gray-900 tracking-wider select-all">
                {code}
              </div>
              <button
                onClick={handleCopy}
                className={`p-3 rounded-xl transition-all ${
                  copied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
              >
                {copied ? <ClipboardCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Copied to clipboard!
              </p>
            )}
          </div>
        )}

        {/* Info Tip */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Tip:</strong> Share this code with others so they can find it instantly. 
            The code is also your direct URL: <code className="bg-white px-1 py-0.5 rounded text-blue-800">/{actionType.replace('_', '-')}/{code}</code>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/${actionType.replace('_', '-')}/${code}`}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <config.viewButtonIcon className="w-5 h-5" />
            {config.viewButtonText}
          </Link>

          <button
            onClick={onCreateAnother}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            <config.createAnotherIcon className="w-5 h-5" />
            {config.createAnotherText}
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventActionModal;