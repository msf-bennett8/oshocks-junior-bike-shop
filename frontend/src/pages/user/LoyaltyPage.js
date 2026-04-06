import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, Gift, TrendingUp, History, Star, Crown, 
  ChevronRight, Lock, CheckCircle, AlertCircle,
  ShoppingBag, Calendar, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoyaltyPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [points, setPoints] = useState({
    balance: 3450,
    lifetimeEarned: 12500,
    redeemed: 9050,
    expiringSoon: 200,
    nextTierProgress: 75, // percent to next tier
  });
  
  const [tier, setTier] = useState({
    current: 'Gold',
    next: 'Platinum',
    benefits: [
      '10% off all purchases',
      'Free express delivery',
      'Priority customer support',
      'Early access to sales',
      'Birthday bonus points',
      'Exclusive member events'
    ]
  });

  // Track tier changes for audit logging
  const previousTierRef = useRef(tier.current);

  useEffect(() => {
    const logTierChange = async () => {
      if (tier.current !== previousTierRef.current) {
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
          await logFrontendAuditEvent(AUDIT_EVENTS.LOYALTY_TIER_CHANGED, {
            category: 'loyalty',
            severity: 'medium',
            metadata: {
              old_tier: previousTierRef.current,
              new_tier: tier.current,
              benefits_unlocked: tier.benefits,
              qualifying_points: points.lifetimeEarned,
              timestamp: new Date().toISOString(),
            },
          });
          previousTierRef.current = tier.current;
        } catch (e) {
          // Silently fail
        }
      }
    };
    logTierChange();
  }, [tier.current, tier.benefits, points.lifetimeEarned]);

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'earned', amount: 500, description: 'Purchase: Mountain Bike Pro', date: '2024-04-01', orderId: 'OJ2024-8888' },
    { id: 2, type: 'earned', amount: 200, description: 'Review bonus', date: '2024-03-28', orderId: null },
    { id: 3, type: 'redeemed', amount: -1000, description: 'Discount on order', date: '2024-03-15', orderId: 'OJ2024-8800' },
    { id: 4, type: 'earned', amount: 750, description: 'Purchase: Cycling Gear Bundle', date: '2024-03-10', orderId: 'OJ2024-8750' },
    { id: 5, type: 'expired', amount: -100, description: 'Points expired', date: '2024-03-01', orderId: null },
  ]);

  const [rewards, setRewards] = useState([
    { id: 1, name: 'KES 500 Discount', points: 1000, image: '🎫', available: true },
    { id: 2, name: 'Free Delivery (1 month)', points: 1500, image: '🚚', available: true },
    { id: 3, name: 'KES 1,000 Discount', points: 2000, image: '🎟️', available: points.balance >= 2000 },
    { id: 4, name: 'Premium Water Bottle', points: 2500, image: '🍼', available: points.balance >= 2500 },
    { id: 5, name: 'Cycling Cap', points: 3000, image: '🧢', available: points.balance >= 3000 },
  ]);

  // Log page view
  useEffect(() => {
    const logView = async () => {
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
        await logFrontendAuditEvent('PAGE_VIEW', {
          category: 'loyalty',
          severity: 'low',
          metadata: {
            page: 'loyalty',
            tier: tier.current,
            points_balance: points.balance,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }
    };
    logView();
  }, []);

  const handleRedeem = async (reward) => {
    if (points.balance < reward.points) {
      alert('Insufficient points!');
      return;
    }

    const confirmed = window.confirm(`Redeem ${reward.name} for ${reward.points} points?`);
    if (!confirmed) return;

    try {
      // API call to redeem would go here
      // await api.post('/loyalty/redeem', { reward_id: reward.id });
      
      // Log points redeemed event
      const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
      
      await logFrontendAuditEvent(AUDIT_EVENTS.POINTS_REDEEMED, {
        category: 'loyalty',
        severity: 'low',
        metadata: {
          user_id: user?.id,
          points_amount: reward.points,
          reward_type: reward.name,
          reward_id: reward.id,
          order_id: null, // Will be set when used
          timestamp: new Date().toISOString(),
        },
      });

      // Update local state
      setPoints(prev => ({
        ...prev,
        balance: prev.balance - reward.points,
        redeemed: prev.redeemed + reward.points
      }));

      // Add transaction
      const newTransaction = {
        id: Date.now(),
        type: 'redeemed',
        amount: -reward.points,
        description: `Redeemed: ${reward.name}`,
        date: new Date().toISOString().split('T')[0],
        orderId: null
      };
      setTransactions(prev => [newTransaction, ...prev]);

      alert(`Successfully redeemed ${reward.name}! Your reward code will be emailed to you.`);
    } catch (error) {
      console.error('Redemption failed:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  const simulateEarnPoints = async (amount, source) => {
    try {
      // Log points earned event
      const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
      
      await logFrontendAuditEvent(AUDIT_EVENTS.POINTS_EARNED, {
        category: 'loyalty',
        severity: 'low',
        metadata: {
          user_id: user?.id,
          points_amount: amount,
          source: source, // 'order', 'referral', 'promo', 'review'
          source_id: `sim_${Date.now()}`,
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
          timestamp: new Date().toISOString(),
        },
      });

      // Log referral completed if source is referral
      if (source === 'referral') {
        await logFrontendAuditEvent(AUDIT_EVENTS.REFERRAL_COMPLETED, {
          category: 'marketing',
          severity: 'low',
          metadata: {
            referrer_user_id: user?.id,
            referee_user_id: `referee_${Date.now()}`, // Would come from actual referral data
            referral_code: 'OSHACKS-REF-12345',
            reward_issued: true,
            reward_type: 'points',
            reward_amount: amount,
            timestamp: new Date().toISOString(),
          },
        });
      }

      setPoints(prev => ({
        ...prev,
        balance: prev.balance + amount,
        lifetimeEarned: prev.lifetimeEarned + amount
      }));

      const newTransaction = {
        id: Date.now(),
        type: 'earned',
        amount: amount,
        description: `${source === 'order' ? 'Purchase' : source}: Bonus points`,
        date: new Date().toISOString().split('T')[0],
        orderId: null
      };
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (e) {
      console.error('Failed to log points earned:', e);
    }
  };

  const getTierColor = (tierName) => {
    const colors = {
      Bronze: 'from-orange-400 to-orange-600',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-400 to-purple-600'
    };
    return colors[tierName] || colors.Bronze;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Oshocks Rewards</h1>
          <p className="text-gray-600 mt-2">Earn points with every purchase and unlock exclusive benefits</p>
        </div>

        {/* Hero Card - Current Status */}
        <div className={`bg-gradient-to-r ${getTierColor(tier.current)} rounded-2xl shadow-xl p-8 text-white mb-8`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-12 h-12" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{tier.current} Member</p>
                <h2 className="text-4xl font-bold mt-1">{points.balance.toLocaleString()} Points</h2>
                <p className="text-white/90 mt-2">
                  {points.nextTierProgress}% to {tier.next}
                </p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
                <p className="text-sm text-white/80">Points Value</p>
                <p className="text-2xl font-bold">KES {(points.balance * 0.5).toLocaleString()}</p>
                <p className="text-xs text-white/70">1 point = KES 0.50</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{tier.current}</span>
              <span>{tier.next}</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${points.nextTierProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{points.lifetimeEarned.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Lifetime Earned</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Gift className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{points.redeemed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Points Redeemed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <ShoppingBag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">24</p>
            <p className="text-sm text-gray-600">Orders Placed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{points.expiringSoon}</p>
            <p className="text-sm text-gray-600">Expiring Soon</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: Award },
              { id: 'rewards', label: 'Rewards', icon: Gift },
              { id: 'history', label: 'History', icon: History },
              { id: 'benefits', label: 'Benefits', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Available Rewards</h3>
                  <Link to="/shop" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Earn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.filter(r => r.available).slice(0, 3).map((reward) => (
                    <div key={reward.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-colors">
                      <div className="text-4xl mb-3">{reward.image}</div>
                      <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                      <p className="text-blue-600 font-bold mt-1">{reward.points.toLocaleString()} points</p>
                      <button
                        onClick={() => handleRedeem(reward)}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-blue-800 text-sm">
                    Write product reviews to earn bonus points! Each verified review earns you 200 points.
                  </p>
                  <button 
                    onClick={() => simulateEarnPoints(200, 'review')}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Simulate Review Points (Demo)
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id} 
                    className={`border-2 rounded-xl p-4 transition-colors ${
                      reward.available ? 'border-gray-200 hover:border-blue-400' : 'border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="text-4xl mb-3">{reward.image}</div>
                    <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                    <p className="text-blue-600 font-bold mt-1">{reward.points.toLocaleString()} points</p>
                    {!reward.available && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <Lock className="w-4 h-4" />
                        Need {reward.points - points.balance} more points
                      </div>
                    )}
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!reward.available}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {reward.available ? 'Redeem' : 'Locked'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' ? 'bg-green-100 text-green-600' :
                        transaction.type === 'redeemed' ? 'bg-blue-100 text-blue-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? <TrendingUp className="w-5 h-5" /> :
                         transaction.type === 'redeemed' ? <Gift className="w-5 h-5" /> :
                         <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {transaction.date}
                          {transaction.orderId && (
                            <span className="ml-2 text-blue-600">• {transaction.orderId}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      transaction.type === 'earned' ? 'text-green-600' :
                      transaction.type === 'redeemed' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : ''}{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <div className={`bg-gradient-to-r ${getTierColor(tier.current)} rounded-xl p-6 text-white`}>
                  <h3 className="text-xl font-bold mb-2">{tier.current} Benefits</h3>
                  <p className="text-white/80">You're enjoying these exclusive perks</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-600 mb-2">Unlock {tier.next} tier for even more benefits!</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${points.nextTierProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Need {Math.ceil((100 - points.nextTierProgress) * 100)} more points</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Refer a Friend</h3>
              <p className="text-gray-600 mt-1">Give KES 500, Get KES 500 when they make their first purchase</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value="OSHACKS-REF-12345" 
                readOnly
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-mono"
              />
              <button 
                onClick={async () => {
                  navigator.clipboard.writeText('OSHACKS-REF-12345');
                  
                  // Log referral code generated event
                  try {
                    const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
                    await logFrontendAuditEvent(AUDIT_EVENTS.REFERRAL_CODE_GENERATED, {
                      category: 'marketing',
                      severity: 'low',
                      metadata: {
                        referral_code: 'OSHACKS-REF-12345',
                        generation_method: 'manual_copy',
                        timestamp: new Date().toISOString(),
                      },
                    });
                  } catch (e) {
                    // Silently fail
                  }
                  
                  alert('Referral code copied!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPage;
