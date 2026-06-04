// ============================================================================
// PROFILE PREVIEW MODAL — Hover tooltip showing user profile overview
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';
import { Mail, Phone, Shield, User, X } from 'lucide-react';

const ProfilePreviewModal = ({ user, children, placement = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!user) return children;

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const tooltipWidth = 280;
    let left = rect.right + 12;
    let top = rect.top;

    // Flip to left if not enough space on right
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = rect.left - tooltipWidth - 12;
    }
    // Keep within viewport vertically
    if (top + 200 > window.innerHeight) {
      top = window.innerHeight - 220;
    }
    if (top < 10) top = 10;

    setPosition({ top, left });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    setIsVisible(false);
  };

  const roleLabels = {
    admin: 'Admin',
    super_admin: 'Super Admin',
    support_agent: 'Support Agent',
    service_agent: 'Service Agent',
    seller: 'Seller',
    buyer: 'Customer',
    user: 'User',
    delivery_agent: 'Delivery Agent',
    shop_attendant: 'Shop Attendant',
    payment_recorder: 'Payment Recorder',
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center cursor-pointer"
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className="fixed z-[100] w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ top: position.top, left: position.left }}
        >
          {/* Header with gradient */}
          <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 relative">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Avatar overlapping header */}
          <div className="px-4 -mt-8 relative">
            <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
              <Avatar
                src={user.avatar}
                name={user.name}
                size={64}
                rounded="full"
              />
            </div>
          </div>

          {/* User info */}
          <div className="px-4 pt-2 pb-4">
            <h3 className="font-semibold text-gray-900 text-base">{user.name}</h3>
            
            {user.role && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            )}

            <div className="mt-3 space-y-2">
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.is_guest && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium">Guest User</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePreviewModal;
