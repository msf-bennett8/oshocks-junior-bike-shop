import { useState, useEffect } from 'react';
import { X, Shield, Check, AlertTriangle, FileText, Bike, DollarSign } from 'lucide-react';

const TERMS_CONTENT = {
  renting: {
    title: 'Terms of Renting',
    icon: Bike,
    description: 'Please review and accept the terms before renting a bike.',
    comingSoon: true,
    sections: [
      'You must be 18+ to rent a bike',
      'Valid ID verification required',
      'Bike must be returned in same condition',
      'Late returns subject to fines',
      'Security deposit required for all rentals',
      'Insurance recommended but optional for most bikes',
    ]
  },
  listing: {
    title: 'Terms of Listing',
    icon: FileText,
    description: 'Please review and accept the terms before listing your bike.',
    comingSoon: true,
    sections: [
      'Bike must be in good working condition',
      'Accurate description and photos required',
      'Platform commission is 15% of rental fee',
      'Lister responsible for bike maintenance',
      'Payouts processed weekly or monthly',
      'Platform reserves right to delist non-compliant bikes',
    ]
  },
  seller_payments: {
    title: 'Seller Payment Terms',
    icon: DollarSign,
    description: 'Please review payment terms for sellers.',
    comingSoon: true,
    sections: [
      'Payouts available weekly or monthly',
      'Minimum payout threshold: KSh 1,000',
      'Bank transfer or M-Pesa options',
      'Payment processing may take 1-3 business days',
      'Disputed payouts held until resolution',
    ]
  }
};

const TermsAcceptanceModal = ({ isOpen, onClose, termsType, onAccept, forceAccept = false }) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const terms = TERMS_CONTENT[termsType] || TERMS_CONTENT.renting;
  const Icon = terms.icon;

  useEffect(() => {
    if (isOpen) {
      setAccepted(false);
      setError(null);
    }
  }, [isOpen, termsType]);

  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!accepted && !forceAccept) {
      setError('You must accept the terms to continue');
      return;
    }
    
    setLoading(true);
    try {
      const api = (await import('../../services/api')).default;
      await api.post('/terms/accept', { terms_type: termsType });
      
      onAccept?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to accept terms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!forceAccept ? onClose : undefined} />
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{terms.title}</h2>
                <p className="text-sm text-green-100">{terms.description}</p>
              </div>
            </div>
            {!forceAccept && (
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {terms.comingSoon && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">Full terms coming soon. Basic terms shown below.</p>
            </div>
          )}

          <div className="space-y-4">
            {terms.sections.map((section, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{section}</p>
              </div>
            ))}
          </div>

          {/* Acceptance Checkbox */}
          <label className="flex items-center gap-3 mt-6 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 transition-colors">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the {terms.title.toLowerCase()}
            </span>
          </label>

          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleAccept}
            disabled={loading || (!accepted && !forceAccept)}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Accept & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptanceModal;
