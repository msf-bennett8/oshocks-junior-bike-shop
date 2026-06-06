import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const EventCreatedSuccessPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Event Created - Oshocks</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Published!</h1>
          <p className="text-gray-600 mb-6">
            Your cycling event is now live and open for bookings.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Event Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-gray-900 font-mono">{code}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/events/${code}`)}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              View Event
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/events')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCreatedSuccessPage;
