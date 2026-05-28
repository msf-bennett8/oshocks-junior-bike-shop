import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Check, Zap, Crown, Star, Bike, ChevronLeft, ArrowRight,
  Shield, Calendar, Users, Percent, Truck, Gift, Clock
} from 'lucide-react';
import { MOCK_MEMBERSHIP_PLANS } from '../../data/cyclingMockData';

const MembershipPlansPage = () => {
  const { planSlug } = useParams();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = MOCK_MEMBERSHIP_PLANS;

  // If planSlug is provided, pre-select that plan
  const preselectedPlan = plans.find(p => p.slug === planSlug);
  const focusedPlan = selectedPlan || preselectedPlan || null;

  const tierIcons = {
    bronze: Bike,
    silver: Zap,
    gold: Crown,
    platinum: Star
  };

  const tierColors = {
    bronze: 'from-amber-700 to-amber-600',
    silver: 'from-gray-400 to-gray-300',
    gold: 'from-yellow-500 to-yellow-400',
    platinum: 'from-slate-300 to-slate-200'
  };

  return (
    <>
      <Helmet>
        <title>Membership Plans - Ride More, Pay Less - Oshocks</title>
        <meta name="description" content="Join Oshocks membership for discounted rides, priority booking, and exclusive cycling events. Bronze, Silver, Gold, and Platinum plans available." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Membership Plans</h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Join our membership program for discounted rides, priority booking, and exclusive events. 
              The more you ride, the more you save.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 bg-gray-200 rounded-full transition-colors"
            >
              <div className={`absolute top-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md transition-transform ${
                billingCycle === 'annual' ? 'translate-x-9' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-semibold ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual <span className="text-green-600 text-xs font-bold ml-1">Save 17%</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {plans.map(plan => {
              const Icon = tierIcons[plan.tier];
              const isFocused = focusedPlan?.id === plan.id;
              const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${
                    isFocused ? 'ring-2 ring-orange-400 ring-offset-2 scale-105' : ''
                  } ${plan.popular ? 'md:-translate-y-4' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg z-10">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Header */}
                  <div className={`bg-gradient-to-br ${tierColors[plan.tier]} p-6 text-white`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm">
                        {plan.tier}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-white/80 text-sm">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">KSh {price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        You save KSh {(plan.price_monthly * 12 - plan.price_annual).toLocaleString()}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What's Included</p>
                    <ul className="space-y-2.5">
                      {plan.features.slice(0, 6).map((feature, idx) => (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Demo: Subscribe to ${plan.name}\n\nIn production, this initiates Paystack/M-Pesa payment for membership subscription.`);
                      }}
                      className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {plan.popular && <Zap className="w-5 h-5" />}
                      Get {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Plan Comparison</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Feature</th>
                      {plans.map(plan => (
                        <th key={plan.id} className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Rides per Month', key: 'rides_included_monthly', format: v => v === 999 ? 'Unlimited' : v },
                      { label: 'Bike Rental Discount', key: 'bike_rental_discount_percent', format: v => `${v}%` },
                      { label: 'Event Discount', key: 'event_discount_percent', format: v => `${v}%` },
                      { label: 'Priority Booking', key: 'priority_booking', format: v => v ? 'Yes' : 'No' },
                      { label: 'Free Transport', key: 'free_transport', format: v => v ? 'Yes' : 'No' },
                      { label: 'Guest Passes', key: 'guest_passes', format: v => v },
                      { label: 'Exclusive Events', key: 'exclusive_events', format: v => v ? 'Yes' : 'No' },
                      { label: 'Merch Discount', key: 'merch_discount_percent', format: v => `${v}%` },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{row.label}</td>
                        {plans.map(plan => (
                          <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-900 font-semibold">
                            {row.format(plan[row.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Can I cancel my membership anytime?', a: 'Yes, all plans can be cancelled at any time. Your benefits continue until the end of your current billing period.' },
                { q: 'Do unused rides roll over?', a: 'No, included rides reset at the start of each billing month. Unused rides do not accumulate.' },
                { q: 'Can I upgrade my plan?', a: 'Yes, you can upgrade anytime. The price difference will be prorated for the remainder of your billing period.' },
                { q: 'Are family plans available?', a: 'Yes! Contact us for family discounts on 3+ memberships.' },
                { q: 'What payment methods are accepted?', a: 'We accept M-Pesa, bank cards via Paystack, and bank transfers for annual plans.' },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembershipPlansPage;