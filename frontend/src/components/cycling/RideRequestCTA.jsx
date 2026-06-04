import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRight, Bike } from 'lucide-react';

const RideRequestCTA = ({ onRequestRide }) => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Bike className="w-4 h-4 text-orange-400" />
            Custom Rides On Demand
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Have a Ride Idea?{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
              We'll Organize It
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Can't find the perfect ride? Tell us your vision — destination, group size, difficulty — 
            and our team will plan and guide your custom cycling adventure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Any Destination</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Flexible Dates</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Users className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Any Group Size</span>
            </div>
          </div>

          <button
            onClick={onRequestRide}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all"
          >
            Request a Custom Ride
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Free quote within 24 hours • No commitment required
          </p>
        </div>
      </div>
    </section>
  );
};

export default RideRequestCTA;