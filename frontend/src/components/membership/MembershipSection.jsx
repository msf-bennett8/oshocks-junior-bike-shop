import { Link } from 'react-router-dom';
import { Zap, ChevronRight } from 'lucide-react';
import MembershipCard from './MembershipCard';
import { MOCK_MEMBERSHIP_PLANS } from '../../data/cyclingMockData';

const MembershipSection = ({ onSubscribe }) => {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              Membership Plans
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ride More, Pay Less</h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Join our membership program for discounted rides, priority booking, and exclusive events. 
              The more you ride, the more you save.
            </p>
          </div>
          <Link 
            to="/membership" 
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all whitespace-nowrap"
          >
            Compare All Plans
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_MEMBERSHIP_PLANS.map(plan => (
            <MembershipCard 
              key={plan.id} 
              plan={plan} 
              onSubscribe={onSubscribe}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            No hidden fees
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Instant activation
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Family plans available
          </span>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
