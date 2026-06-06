import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowLeft, Construction, Sparkles } from 'lucide-react';

const ComingSoonPage = ({ title = 'Coming Soon', description = 'This feature is under development.' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Helmet><title>{title} | Oshocks</title></Helmet>
      
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Construction className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Expected Soon</span>
          </div>
          <p className="text-sm text-gray-500">
            Our team is working hard to bring you this feature. 
            Check back soon for updates!
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoonPage;
