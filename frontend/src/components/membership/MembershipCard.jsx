import React from 'react';
import { Check, Zap, Crown, Star, Bike } from 'lucide-react';

const MembershipCard = ({ plan, onSubscribe }) => {
  const isPopular = plan.popular;
  const tierColors = {
    bronze: 'from-amber-700 to-amber-600',
    silver: 'from-gray-400 to-gray-300',
    gold: 'from-yellow-500 to-yellow-400',
    platinum: 'from-slate-300 to-slate-200'
  };

  const tierBorderColors = {
    bronze: 'border-amber-200',
    silver: 'border-gray-200',
    gold: 'border-yellow-200',
    platinum: 'border-slate-200'
  };

  const tierBadgeColors = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-gray-100 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-slate-100 text-slate-800'
  };

  const IconComponent = plan.icon === 'Zap' ? Zap : plan.icon === 'Crown' ? Crown : plan.icon === 'Star' ? Star : Bike;

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${tierBorderColors[plan.tier]} ${isPopular ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg z-10">
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-br ${tierColors[plan.tier]} p-6 text-white`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm`}>
              {plan.tier}
            </span>
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
        <p className="text-white/80 text-sm">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">KSh {plan.price_monthly.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">/month</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">or KSh {plan.price_annual.toLocaleString()}/year</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            Save {plan.annual_discount_percent}%
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What's Included</p>
        <ul className="space-y-2.5">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={() => onSubscribe?.(plan)}
          className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            isPopular 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isPopular ? <Zap className="w-5 h-5" /> : null}
          Get {plan.name}
        </button>
      </div>
    </div>
  );
};

export default MembershipCard;