import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bell, BellOff, Package, Truck, CreditCard, Tag, Heart, MessageSquare, Gift, 
  CheckCircle, X, Settings, Trash2, MailOpen, Clock, ArrowLeft, Star, Zap,
  Search, Filter, ChevronDown, MoreHorizontal, Archive, Volume2, VolumeX,
  Smartphone, Mail, CheckSquare, Square, RefreshCw, Download, BellRing,
  ShoppingBag, MapPin, AlertCircle, TrendingUp, User, Calendar, Clock3,
  CheckCheck, Trash, ExternalLink, Sparkles, Store, Pin, PinOff, History,
  AlertTriangle, Boxes, Users, Receipt, TrendingDown, FileText, Eye,
  ChevronRight, Share2, Printer, Copy, Check, XCircle, Info, Shield,
  Megaphone, BarChart3, Wallet, TruckIcon, PackageCheck, PackageX,
  PackageOpen, Clock4, Timer, CalendarDays, ArrowUpRight, ArrowDownRight,
  MoreVertical, Flag, Bookmark, BookmarkX, Send, Reply, ThumbsUp, ThumbsDown,
  LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// NOTIFICATIONS PAGE - MODERN E-COMMERCE VERSION
// Version: 3.0 - With Real-time Features & Modern UI
// ============================================================================

const NotificationsPage = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  // Modal State
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pinning State
  const [pinnedIds, setPinnedIds] = useState(() => {
    return JSON.parse(localStorage.getItem('pinnedNotifications') || '[]');
  });

  // Sound & accessibility settings
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // Notification preferences with granular control
  const [notificationSettings, setNotificationSettings] = useState({
    // Channel preferences
    channels: {
      push: true,
      email: true,
      sms: false,
      inApp: true
    },
    // Category preferences
    categories: {
      orders: { enabled: true, push: true, email: true },
      shipping: { enabled: true, push: true, email: true },
      payments: { enabled: true, push: true, email: true },
      promotions: { enabled: true, push: false, email: true },
      wishlist: { enabled: true, push: false, email: false },
      messages: { enabled: true, push: true, email: false },
      reviews: { enabled: true, push: false, email: true },
      system: { enabled: true, push: true, email: true },
      inventory: { enabled: true, push: true, email: true },
      audit: { enabled: true, push: false, email: true },
      admin: { enabled: true, push: true, email: true }
    },
    // Quiet hours
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });

  // Refs for intersection observer (infinite scroll)
  const observerRef = useRef(null);
  const lastNotificationRef = useRef(null);

  // ============================================================================
  // ENHANCED CATEGORIES WITH AUDIT & ADMIN
  // ============================================================================
  const categories = [
    { 
      id: 'all', 
      label: 'All', 
      icon: Bell, 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      description: 'All your notifications'
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ShoppingBag, 
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Order updates & confirmations'
    },
    { 
      id: 'shipping', 
      label: 'Shipping', 
      icon: Truck, 
      color: 'violet',
      gradient: 'from-violet-500 to-violet-600',
      description: 'Delivery & tracking updates'
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: CreditCard, 
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      description: 'Payment confirmations & refunds'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Boxes, 
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      description: 'Low stock & inventory alerts'
    },
    { 
      id: 'promotions', 
      label: 'Deals', 
      icon: Tag, 
      color: 'rose',
      gradient: 'from-rose-500 to-rose-600',
      description: 'Sales, offers & promotions'
    },
    { 
      id: 'wishlist', 
      label: 'Wishlist', 
      icon: Heart, 
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
      description: 'Price drops & back in stock'
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageSquare, 
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Support & seller messages'
    },
    { 
      id: 'audit', 
      label: 'Audit', 
      icon: History, 
      color: 'slate',
      gradient: 'from-slate-500 to-slate-600',
      description: 'System audit logs'
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Shield, 
      color: 'cyan',
      gradient: 'from-cyan-500 to-cyan-600',
      description: 'Admin & mass notifications'
    },
    { 
      id: 'system', 
      label: 'System', 
      icon: Sparkles, 
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600',
      description: 'Account & security alerts'
    },
    { 
      id: 'archived', 
      label: 'Archived', 
      icon: Archive, 
      color: 'gray',
      gradient: 'from-gray-400 to-gray-500',
      description: 'Archived notifications'
    }
  ];

  // ============================================================================
  // COMPREHENSIVE MOCK DATA - ALL E-COMMERCE SCENARIOS
  // ============================================================================
  const generateMockNotifications = () => [
    // PINNED NOTIFICATIONS (High Priority)
    {
      id: 'notif-pinned-001',
      type: 'inventory',
      priority: 'urgent',
      title: '🚨 Critical Low Stock Alert',
      message: 'Trek Marlin 7 (Medium) is down to 3 units. Reorder threshold: 10 units. Supplier: BikeWorld Kenya.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
      isArchived: false,
      isPinned: true,
      icon: TrendingDown,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      iconGradient: 'from-red-400 to-red-600',
      actionUrl: '/admin/inventory/reorder/SKU-TREK-M7-M',
      actionLabel: 'Reorder Now',
      metadata: {
        sku: 'SKU-TREK-M7-M',
        product: 'Trek Marlin 7 (Medium)',
        currentStock: 3,
        threshold: 10,
        supplier: 'BikeWorld Kenya',
        lastRestocked: '2024-03-15',
        avgDailySales: 2.5,
        estimatedStockout: '1.2 days'
      },
      actions: [
        { label: 'Reorder', url: '/admin/inventory/reorder/SKU-TREK-M7-M', primary: true },
        { label: 'View Stock', url: '/admin/inventory/SKU-TREK-M7-M', primary: false },
        { label: 'Adjust Threshold', action: 'adjust', primary: false }
      ],
      auditLog: {
        event: 'STOCK_THRESHOLD_BREACH',
        severity: 'critical',
        triggeredBy: 'system',
        automated: true,
        previousStock: 4,
        notificationsSent: ['admin', 'inventory_manager']
      }
    },
    // ORDERS
    {
      id: 'notif-001',
      type: 'orders',
      priority: 'high',
      title: '🎉 Mass Purchase Order Confirmed!',
      message: 'Corporate order #CORP-2024-001 from Nairobi Cycling Club: 25 bikes, total KES 2,125,000. Payment verified.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false,
      isArchived: false,
      isPinned: false,
      icon: Users,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconGradient: 'from-emerald-400 to-emerald-600',
      actionUrl: '/orders/CORP-2024-001',
      actionLabel: 'Manage Order',
      metadata: {
        orderId: 'CORP-2024-001',
        customer: 'Nairobi Cycling Club',
        type: 'corporate',
        items: 25,
        amount: 'KES 2,125,000',
        bikes: ['Trek Marlin 7 x15', 'Giant Talon 2 x10'],
        deliveryDate: '2024-04-15',
        specialRequests: 'Custom branding on 10 bikes'
      },
      actions: [
        { label: 'Process', url: '/orders/CORP-2024-001/process', primary: true },
        { label: 'Invoice', url: '/orders/CORP-2024-001/invoice', primary: false },
        { label: 'Contact Client', action: 'message', primary: false }
      ],
      auditLog: {
        event: 'MASS_PURCHASE_CONFIRMED',
        value: 2125000,
        items: 25,
        verifiedBy: 'payment_gateway',
        riskScore: 'low'
      }
    },
    {
      id: 'notif-002',
      type: 'shipping',
      priority: 'high',
      title: '🚚 Express Delivery Out for Delivery',
      message: 'Order #OJ2024-8888 (Same-day delivery) is 3 stops away. ETA: 18 minutes.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
      isArchived: false,
      icon: Zap,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
      iconGradient: 'from-violet-400 to-violet-600',
      actionUrl: '/track/live/TRK-888999',
      actionLabel: 'Live Track',
      metadata: {
        trackingId: 'TRK-888999',
        driver: 'John M.',
        vehicle: 'Toyota Hilux KCY 123X',
        eta: '18 mins',
        stopsAway: 3,
        currentLocation: 'Kilimani, Ngong Rd',
        deliveryType: 'same_day',
        customerPhone: '+254 712 345 678'
      },
      actions: [
        { label: 'Live Map', url: '/track/live/TRK-888999', primary: true },
        { label: 'Call Driver', action: 'tel:+254712000001', primary: false },
        { label: 'Reschedule', action: 'reschedule', primary: false }
      ]
    },
    // INVENTORY ALERTS
    {
      id: 'notif-003',
      type: 'inventory',
      priority: 'high',
      title: '⚠️ Stock Running Low',
      message: '5 products below reorder threshold. Review inventory report.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: false,
      isArchived: false,
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      iconGradient: 'from-orange-400 to-orange-600',
      actionUrl: '/admin/inventory/low-stock',
      actionLabel: 'View Report',
      metadata: {
        totalLowStock: 5,
        products: [
          { name: 'Trek Marlin 7', stock: 3, threshold: 10 },
          { name: 'Giant Talon 2', stock: 5, threshold: 15 },
          { name: 'Helmet Giro Fixture', stock: 8, threshold: 20 },
          { name: 'Pedals Shimano PD-M520', stock: 4, threshold: 12 },
          { name: 'Tube 26" Schwalbe', stock: 6, threshold: 25 }
        ],
        category: 'mixed'
      },
      actions: [
        { label: 'View All', url: '/admin/inventory/low-stock', primary: true },
        { label: 'Generate PO', action: 'generate_po', primary: false },
        { label: 'Export CSV', action: 'export', primary: false }
      ],
      auditLog: {
        event: 'BULK_LOW_STOCK_ALERT',
        productsAffected: 5,
        autoGeneratedPO: false,
        notifiedRoles: ['admin', 'inventory_manager', 'procurement']
      }
    },
    // NEW PRODUCT ALERTS
    {
      id: 'notif-004',
      type: 'admin',
      priority: 'medium',
      title: '🆕 New Product: 2024 Trek Fuel EX',
      message: 'New arrival: Trek Fuel EX 9.8 GX AXS Gen 6. 15 units in stock. MSRP: KES 485,000.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
      isArchived: false,
      icon: PackageCheck,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-100',
      iconGradient: 'from-cyan-400 to-cyan-600',
      actionUrl: '/product/trek-fuel-ex-9-8',
      actionLabel: 'View Product',
      metadata: {
        product: 'Trek Fuel EX 9.8 GX AXS Gen 6',
        sku: 'SKU-TREK-FUEL-EX-98',
        category: 'Mountain Bikes',
        price: 'KES 485,000',
        stock: 15,
        features: ['Carbon frame', 'SRAM GX AXS', 'Bontrager Line Elite 30'],
        arrivalDate: '2024-04-03',
        supplier: 'Trek Bicycles Kenya'
      },
      actions: [
        { label: 'View', url: '/product/trek-fuel-ex-9-8', primary: true },
        { label: 'Edit Listing', url: '/admin/products/edit/SKU-TREK-FUEL-EX-98', primary: false },
        { label: 'Promote', action: 'create_campaign', primary: false }
      ],
      auditLog: {
        event: 'NEW_PRODUCT_ARRIVAL',
        addedBy: 'system',
        autoListed: true,
        qualityCheck: 'passed'
      }
    },
    // AUDIT LOGS
    {
      id: 'notif-005',
      type: 'audit',
      priority: 'medium',
      title: '📋 Price Change Audit Log',
      message: 'Price modified for 12 products by admin_user_001. Average increase: 5.3%.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true,
      isArchived: false,
      icon: FileText,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      iconGradient: 'from-slate-400 to-slate-600',
      actionUrl: '/audit/logs/price-changes/2024-04-03',
      actionLabel: 'View Audit',
      metadata: {
        changes: 12,
        modifiedBy: 'admin_user_001',
        avgChange: '+5.3%',
        range: 'KES 500 - KES 15,000',
        reason: 'Supplier cost increase',
        approvedBy: 'super_admin_001',
        timestamp: '2024-04-03 14:30:00'
      },
      actions: [
        { label: 'View Log', url: '/audit/logs/price-changes/2024-04-03', primary: true },
        { label: 'Export PDF', action: 'export_pdf', primary: false },
        { label: 'Revert', action: 'revert', primary: false, danger: true }
      ],
      auditLog: {
        event: 'BULK_PRICE_MODIFICATION',
        changes: 12,
        modifiedBy: 'admin_user_001',
        approvedBy: 'super_admin_001',
        reason: 'Supplier cost increase - Q2 2024',
        rollbackAvailable: true
      }
    },
    {
      id: 'notif-006',
      type: 'audit',
      priority: 'high',
      title: '🔒 Security Audit: Failed Login Attempts',
      message: '15 failed login attempts detected from IP 197.237.x.x. Account temporarily locked.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: false,
      isArchived: false,
      icon: Shield,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      iconGradient: 'from-slate-400 to-slate-600',
      actionUrl: '/audit/security/failed-logins',
      actionLabel: 'Review',
      metadata: {
        attempts: 15,
        ipAddress: '197.237.x.x',
        location: 'Nairobi, Kenya',
        targetAccount: 'admin_user_002',
        timeWindow: '10 minutes',
        status: 'auto_blocked',
        recommendedAction: 'Review and unblock if legitimate'
      },
      actions: [
        { label: 'Review', url: '/audit/security/failed-logins', primary: true },
        { label: 'Unblock', action: 'unblock', primary: false },
        { label: 'Ban IP', action: 'ban_ip', primary: false, danger: true }
      ],
      auditLog: {
        event: 'BRUTE_FORCE_ATTEMPT_DETECTED',
        severity: 'high',
        autoResponse: 'account_locked',
        notified: ['security_team', 'admin']
      }
    },
    // ADMIN/MASS NOTIFICATIONS
    {
      id: 'notif-007',
      type: 'admin',
      priority: 'urgent',
      title: '📢 System Maintenance Notice',
      message: 'Scheduled maintenance: April 5, 2024 02:00-04:00 EAT. Payment processing unavailable.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isRead: false,
      isArchived: false,
      icon: Megaphone,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-100',
      iconGradient: 'from-cyan-400 to-cyan-600',
      actionUrl: '/admin/system/maintenance-schedule',
      actionLabel: 'Details',
      metadata: {
        maintenanceId: 'MAINT-2024-04-05',
        startTime: '2024-04-05 02:00 EAT',
        endTime: '2024-04-05 04:00 EAT',
        duration: '2 hours',
        affectedServices: ['payments', 'order_processing', 'inventory_sync'],
        impact: 'high',
        sentTo: 'all_users',
        readReceipts: 'enabled'
      },
      actions: [
        { label: 'View Schedule', url: '/admin/system/maintenance-schedule', primary: true },
        { label: 'Set Reminder', action: 'reminder', primary: false },
        { label: 'Acknowledge', action: 'ack', primary: false }
      ],
      auditLog: {
        event: 'MASS_NOTIFICATION_SENT',
        recipients: 'all_users',
        sentBy: 'system_admin',
        category: 'maintenance'
      }
    },
    // PAYMENTS
    {
      id: 'notif-008',
      type: 'payments',
      priority: 'high',
      title: '💰 Refund Processed',
      message: 'Refund of KES 45,000 for order #OJ2024-7777 processed. M-Pesa confirmation: REF123456.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isRead: true,
      isArchived: false,
      icon: Wallet,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      iconGradient: 'from-amber-400 to-amber-600',
      actionUrl: '/payments/refunds/REF123456',
      actionLabel: 'Receipt',
      metadata: {
        refundId: 'REF123456',
        originalOrder: 'OJ2024-7777',
        amount: 'KES 45,000',
        method: 'M-Pesa',
        reason: 'Product defect - handlebar crack',
        processedBy: 'refund_system',
        timeline: '2 hours from request'
      },
      actions: [
        { label: 'Receipt', url: '/payments/refunds/REF123456/receipt', primary: true },
        { label: 'View Order', url: '/orders/OJ2024-7777', primary: false }
      ],
      auditLog: {
        event: 'REFUND_PROCESSED',
        amount: 45000,
        reason: 'defect',
        autoApproved: false,
        approvedBy: 'admin_user_003'
      }
    },
    // WISHLIST
    {
      id: 'notif-009',
      type: 'wishlist',
      priority: 'medium',
      title: '💸 Flash Sale: Your Wishlist Items!',
      message: '3 items from your wishlist are now 30% OFF! Sale ends in 4 hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      isRead: false,
      isArchived: false,
      icon: Heart,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-100',
      iconGradient: 'from-pink-400 to-pink-600',
      actionUrl: '/wishlist/sale-items',
      actionLabel: 'Shop Sale',
      metadata: {
        itemsOnSale: 3,
        discount: '30%',
        saleEnd: '4 hours',
        products: [
          { name: 'Giant Talon 2', oldPrice: 80000, newPrice: 56000 },
          { name: 'Giro Helmet', oldPrice: 8500, newPrice: 5950 },
          { name: 'Shimano Pedals', oldPrice: 12000, newPrice: 8400 }
        ],
        totalSavings: 'KES 46,550'
      }
    },
    // MESSAGES
    {
      id: 'notif-010',
      type: 'messages',
      priority: 'medium',
      title: '💬 Urgent: Delivery Issue',
      message: 'Driver reports: Customer not available at delivery address. Attempt 2 of 3.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
      isArchived: false,
      icon: AlertCircle,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      iconGradient: 'from-indigo-400 to-indigo-600',
      actionUrl: '/messages/delivery-issue-TRK888999',
      actionLabel: 'Respond',
      metadata: {
        threadId: 'delivery-issue-TRK888999',
        orderId: 'OJ2024-8888',
        driver: 'John M.',
        issue: 'Customer unavailable',
        attempts: 2,
        maxAttempts: 3,
        nextAction: 'Reschedule or pickup from depot',
        escalation: 'pending_customer_response'
      }
    },
    // MORE VARIETY...
    {
      id: 'notif-011',
      type: 'orders',
      priority: 'medium',
      title: '📦 Order Ready for Pickup',
      message: 'Order #OJ2024-8890 is ready at Oshocks Ngong Road store. Pickup code: 8842.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      isRead: true,
      isArchived: false,
      icon: Store,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconGradient: 'from-emerald-400 to-emerald-600',
      actionUrl: '/pickup/8842',
      actionLabel: 'Directions',
      metadata: {
        pickupCode: '8842',
        store: 'Oshocks Ngong Road',
        address: 'Ngong Road, near Prestige Plaza',
        hours: 'Mon-Sat: 8AM-7PM, Sun: 10AM-4PM',
        itemsReady: 3,
        holdUntil: '2024-04-10'
      }
    },
    {
      id: 'notif-012',
      type: 'promotions',
      priority: 'low',
      title: '🎁 Loyalty Reward Unlocked!',
      message: 'You\'ve earned Gold status! Enjoy 10% off all purchases for the next 30 days.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
      isArchived: false,
      icon: Star,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      iconGradient: 'from-yellow-400 to-yellow-600',
      actionUrl: '/loyalty/gold-benefits',
      actionLabel: 'View Benefits',
      metadata: {
        tier: 'Gold',
        previousTier: 'Silver',
        spendToUpgrade: 'KES 150,000',
        benefits: ['10% off all purchases', 'Free express delivery', 'Priority support', 'Early access to sales'],
        validUntil: '2024-05-03'
      }
    }
  ];

  // ============================================================================
  // DATA LOADING & REAL-TIME SIMULATION
  // ============================================================================
  useEffect(() => {
    loadNotifications();
    
    // Simulate real-time notification (WebSocket would replace this)
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        simulateNewNotification();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const data = generateMockNotifications();
    // Apply pinned status from localStorage
    const withPins = data.map(n => ({
      ...n,
      isPinned: pinnedIds.includes(n.id)
    }));
    setNotifications(withPins);
    setIsLoading(false);
  };

  const simulateNewNotification = () => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'inventory',
      priority: 'urgent',
      title: '🚨 Stock Alert: Popular Item',
      message: 'Scott Aspect 950 is selling fast! Only 8 units remaining.',
      timestamp: new Date(),
      isRead: false,
      isArchived: false,
      isPinned: false,
      icon: TrendingDown,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      actionUrl: '/admin/inventory/SKU-SCOTT-A950',
      actionLabel: 'Check Stock'
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    
    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }
    
    // Show browser notification if enabled
    if (desktopNotifications && Notification.permission === 'granted') {
      new Notification('Oshocks', {
        body: newNotif.message,
        icon: '/logo.png'
      });
    }
  };

  // ============================================================================
  // PINNING FUNCTIONALITY
  // ============================================================================
  const togglePin = (id) => {
    const newPinnedIds = pinnedIds.includes(id)
      ? pinnedIds.filter(pid => pid !== id)
      : [...pinnedIds, id];
    
    setPinnedIds(newPinnedIds);
    localStorage.setItem('pinnedNotifications', JSON.stringify(newPinnedIds));
    
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  // ============================================================================
  // MODAL HANDLING
  // ============================================================================
  const openModal = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    // Mark as read when opened
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedNotification(null), 300);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) closeModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  // ============================================================================
  // FILTERING & SEARCH LOGIC
  // ============================================================================
  const getFilteredNotifications = useCallback(() => {
    let filtered = notifications;

    // Pinned items always first
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    // Category filter
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.metadata?.orderId?.toLowerCase().includes(query)
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(n => {
        const notifDate = new Date(n.timestamp);
        return notifDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(n => new Date(n.timestamp) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(n => new Date(n.timestamp) >= monthAgo);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

    return filtered;
  }, [notifications, filter, searchQuery, dateFilter, sortBy, pinnedIds]);

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length;
  const pinnedCount = notifications.filter(n => n.isPinned).length;

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================
  const markAsRead = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setNotifications(prev =>
      prev.map(n => idsArray.includes(n.id) ? { ...n, isRead: true } : n)
    );
  };

  const markAsUnread = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setNotifications(prev =>
      prev.map(n => idsArray.includes(n.id) ? { ...n, isRead: false } : n)
    );
  };

  const archiveNotifications = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setNotifications(prev =>
      prev.map(n => idsArray.includes(n.id) ? { ...n, isArchived: true, isPinned: false } : n)
    );
    // Remove from pinned if archived
    const newPinnedIds = pinnedIds.filter(id => !idsArray.includes(id));
    setPinnedIds(newPinnedIds);
    localStorage.setItem('pinnedNotifications', JSON.stringify(newPinnedIds));
  };

  const deleteNotifications = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setNotifications(prev => prev.filter(n => !idsArray.includes(n.id)));
    setSelectedNotifications([]);
    // Remove from pinned if deleted
    const newPinnedIds = pinnedIds.filter(id => !idsArray.includes(id));
    setPinnedIds(newPinnedIds);
    localStorage.setItem('pinnedNotifications', JSON.stringify(newPinnedIds));
  };

  const toggleSelection = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const visibleIds = filteredNotifications.map(n => n.id);
    const allSelected = visibleIds.every(id => selectedNotifications.includes(id));
    
    if (allSelected) {
      setSelectedNotifications(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedNotifications(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  // ============================================================================
  // FORMATTING UTILITIES
  // ============================================================================
  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: days > 365 ? 'numeric' : undefined
    });
  };

  const getPriorityStyles = (priority, isPinned) => {
    const baseStyles = isPinned ? 'ring-2 ring-orange-400 ring-offset-2' : '';
    const styles = {
      urgent: `border-l-4 border-red-500 bg-red-50/30 ${baseStyles}`,
      high: `border-l-4 border-orange-500 bg-orange-50/30 ${baseStyles}`,
      medium: `border-l-4 border-blue-400 bg-blue-50/20 ${baseStyles}`,
      low: `border-l-4 border-gray-300 ${baseStyles}`
    };
    return styles[priority] || styles.low;
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================
  
  // ============================================================================
  // NOTIFICATION DETAIL MODAL
  // ============================================================================
  const NotificationModal = () => {
    if (!selectedNotification) return null;
    
    const n = selectedNotification;
    const Icon = n.icon;
    
    return (
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Modal - Positioned bottom-right but moved up to ensure visibility */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto sm:w-full sm:max-w-2xl sm:max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${n.iconGradient} p-6 text-white flex-shrink-0`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">{n.title}</h2>
                        {n.isPinned && <Pin className="w-5 h-5 fill-current" />}
                      </div>
                      <p className="text-white/80 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTimestamp(n.timestamp)}
                        {n.priority === 'urgent' && (
                          <span className="bg-red-500/80 px-2 py-0.5 rounded text-xs">URGENT</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Main Message */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed">{n.message}</p>
                </div>

                {/* Metadata Cards */}
                {n.metadata && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(n.metadata).map(([key, value]) => {
                        if (typeof value === 'object') return null;
                        return (
                          <div key={key} className="flex flex-col">
                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Product List if available */}
                    {n.metadata.products && Array.isArray(n.metadata.products) && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Products</h4>
                        <div className="space-y-2">
                          {n.metadata.products.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                              <span className="font-medium text-gray-900">{product.name || product}</span>
                              {product.newPrice && (
                                <div className="text-right">
                                  <span className="text-green-600 font-bold">KES {product.newPrice.toLocaleString()}</span>
                                  {product.oldPrice && (
                                    <span className="text-gray-400 line-through text-sm ml-2">KES {product.oldPrice.toLocaleString()}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Log Section */}
                {n.auditLog && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <History className="w-4 h-4" />
                      Audit Log
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(n.auditLog).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium text-slate-900">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                             Array.isArray(value) ? value.join(', ') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  {n.actions?.map((action, idx) => (
                    action.url ? (
                      <a
                        key={idx}
                        href={action.url}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          action.primary 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : action.danger
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {action.label}
                      </a>
                    ) : (
                      <button
                        key={idx}
                        onClick={() => {
                          if (action.action === 'adjust') alert('Adjust threshold modal would open');
                          if (action.action === 'reschedule') alert('Reschedule modal would open');
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          action.primary 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : action.danger
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {action.label}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(n.id)}
                    className={`p-2 rounded-lg transition-colors ${n.isPinned ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-200 text-gray-600'}`}
                    title={n.isPinned ? 'Unpin' : 'Pin'}
                  >
                    {n.isPinned ? <Pin className="w-5 h-5 fill-current" /> : <PinOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${n.title}\n${n.message}`);
                      alert('Copied to clipboard!');
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                    title="Copy"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {!n.isRead ? (
                    <button
                      onClick={() => markAsRead([n.id])}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Mark as Read
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsUnread([n.id])}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Mark as Unread
                    </button>
                  )}
                  <button
                    onClick={() => {
                      archiveNotifications([n.id]);
                      closeModal();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Skeleton Loading Component
  const NotificationSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-12 text-center"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <BellOff className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {searchQuery ? 'No matches found' : filter !== 'all' ? `No ${filter} notifications` : "You're all caught up!"}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {searchQuery 
          ? `No notifications match "${searchQuery}". Try a different search term.`
          : filter !== 'all'
          ? `You don't have any ${filter} notifications at the moment.`
          : "Check back later for order updates, deals, and more."}
      </p>
      {(searchQuery || filter !== 'all') && (
        <button 
          onClick={() => { setSearchQuery(''); setFilter('all'); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </motion.div>
  );

  // Settings Panel Component
  const SettingsPanel = () => (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-white border-b border-gray-200 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Channel Preferences */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Delivery Channels
            </h3>
            {Object.entries(notificationSettings.channels).map(([channel, enabled]) => (
              <label key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  {channel === 'push' && <BellRing className="w-4 h-4 text-gray-600" />}
                  {channel === 'email' && <Mail className="w-4 h-4 text-gray-600" />}
                  {channel === 'sms' && <MessageSquare className="w-4 h-4 text-gray-600" />}
                  {channel === 'inApp' && <Bell className="w-4 h-4 text-gray-600" />}
                  <span className="font-medium text-gray-900 capitalize">{channel}</span>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({
                    ...prev,
                    channels: { ...prev.channels, [channel]: !enabled }
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </label>
            ))}
          </div>

          {/* Sound & Desktop */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Sound & Alerts
            </h3>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-600" /> : <VolumeX className="w-4 h-4 text-gray-600" />}
                <span className="font-medium text-gray-900">Notification Sounds</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <BellRing className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">Desktop Notifications</span>
              </div>
              <button
                onClick={() => {
                  if (!desktopNotifications && Notification.permission !== 'granted') {
                    Notification.requestPermission();
                  }
                  setDesktopNotifications(!desktopNotifications);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${desktopNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${desktopNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </label>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Category Preferences</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(notificationSettings.categories).map(([category, settings]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 capitalize">{category}</span>
                  <button
                    onClick={() => setNotificationSettings(prev => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        [category]: { ...settings, enabled: !settings.enabled }
                      }
                    }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {settings.enabled && (
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setNotificationSettings(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          [category]: { ...settings, push: !settings.push }
                        }
                      }))}
                      className={`px-2 py-1 rounded ${settings.push ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}
                    >
                      Push
                    </button>
                    <button
                      onClick={() => setNotificationSettings(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          [category]: { ...settings, email: !settings.email }
                        }
                      }))}
                      className={`px-2 py-1 rounded ${settings.email ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}
                    >
                      Email
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-gray-900 h-48 overflow-hidden">
          {/* Animated Background - Same as Homepage */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
              }}
            />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-20">
          {[1, 2, 3, 4, 5].map(i => <NotificationSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Matching Homepage Hero Style */}
      <div className="relative text-white overflow-hidden bg-gray-900">
        {/* Animated Background - Same as Homepage */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
            }}
          />
          <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1485965120184-e224f7a1d7f0?w=1920&q=80)] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        {/* Floating Gradient Orb */}
        <div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ 
            background: 'linear-gradient(135deg, rgb(255, 69, 0), rgb(255, 165, 0))',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {/* Top Bar - Back button and controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 backdrop-blur-sm rounded-lg transition-all ${showSettings ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title Section - Single row layout */}
              <div className="flex items-center gap-4 mb-6">
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Bell className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Title and Badges - Inline */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Notifications</h1>
                  
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {unreadCount > 0 ? (
                      <>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                          {unreadCount} unread
                        </span>
                        {urgentCount > 0 && (
                          <span className="bg-red-500/90 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {urgentCount} urgent
                          </span>
                        )}
                        {pinnedCount > 0 && (
                          <span className="bg-orange-500/50 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Pin className="w-3 h-3" />
                            {pinnedCount} pinned
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        All caught up!
                      </span>
                    )}
                    {/* Archived count badge - clickable to filter */}
                    <button
                      onClick={() => setFilter('archived')}
                      className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors"
                    >
                      <Archive className="w-3 h-3" />
                      {notifications.filter(n => n.isArchived).length} archived
                    </button>
                  </div>
                </div>

                {/* Quick Actions - Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAsRead(notifications.filter(n => !n.isRead).map(n => n.id))}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all text-sm flex-shrink-0"
                  >
                    <MailOpen className="w-4 h-4" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm rounded-xl border transition-all ${showFilters ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' }
                  ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDateFilter(d.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${dateFilter === d.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-white/20 mx-2" />
                  {[
                    { id: 'newest', label: 'Newest First' },
                    { id: 'oldest', label: 'Oldest First' },
                    { id: 'priority', label: 'Priority' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${sortBy === s.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && <SettingsPanel />}
      </AnimatePresence>

      {/* Category Tabs - Horizontal scroll on all screen sizes with responsive padding */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div 
            className="flex overflow-x-auto space-x-2 py-3 px-4 scroll-smooth snap-x snap-mandatory"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              msOverflowStyle: 'auto',
              overflowX: 'auto',
              flexWrap: 'nowrap'
            }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? notifications.filter(n => !n.isArchived).length
                : notifications.filter(n => n.type === category.id && !n.isArchived).length;
              const isActive = filter === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-[5px] whitespace-nowrap transition-all snap-start flex-shrink-0 text-sm ${isActive ? `bg-gradient-to-r ${category.gradient} text-white shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  style={{ flex: '0 0 auto' }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{category.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-gray-200'}`}>
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectMode && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-[73px] z-30 bg-orange-600 text-white shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="flex items-center gap-2 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                {selectedNotifications.length === filteredNotifications.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                <span>{selectedNotifications.length} selected</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAsRead(selectedNotifications)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Mark as read"
              >
                <MailOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => archiveNotifications(selectedNotifications)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteNotifications(selectedNotifications)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-rose-200"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/30 mx-2" />
              <button
                onClick={() => { setSelectMode(false); setSelectedNotifications([]); }}
                className="px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3">
            {/* View Mode Toggles */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={() => setSelectMode(!selectMode)}
              className={`text-sm font-medium transition-colors ${selectMode ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {selectMode ? 'Cancel' : 'Select'}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'list' ? (
          /* LIST VIEW - Original Oshocks Style */
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const Icon = notification.icon;
                const isSelected = selectedNotifications.includes(notification.id);
                const isLast = index === filteredNotifications.length - 1;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    ref={isLast ? lastNotificationRef : null}
                    onClick={() => !selectMode && openModal(notification)}
                    className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${getPriorityStyles(notification.priority, notification.isPinned)} ${isSelected ? 'ring-2 ring-orange-500' : ''} ${notification.isArchived ? 'opacity-60' : ''}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        {selectMode && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelection(notification.id); }}
                            className="mt-1 flex-shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-orange-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        )}

                        {/* Pin Indicator */}
                        {notification.isPinned && !selectMode && (
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <Pin className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}

                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 ${notification.iconBg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <Icon className={`w-6 h-6 ${notification.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                              {notification.title}
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                              )}
                              {notification.priority === 'urgent' && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  Urgent
                                </span>
                              )}
                              {notification.isPinned && (
                                <Pin className="w-4 h-4 text-orange-500 fill-current" />
                              )}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Metadata Tags */}
                          {notification.metadata && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {notification.metadata.orderId && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {notification.metadata.orderId}
                                </span>
                              )}
                              {notification.metadata.sku && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                  {notification.metadata.sku}
                                </span>
                              )}
                              {notification.metadata.amount && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                                  {notification.metadata.amount}
                                </span>
                              )}
                              {notification.metadata.eta && (
                                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  ETA: {notification.metadata.eta}
                                </span>
                              )}
                              {notification.auditLog && (
                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded flex items-center gap-1">
                                  <History className="w-3 h-3" />
                                  Audit Log
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actions Preview */}
                          <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openModal(notification)}
                              className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                            >
                              View Details
                              <Eye className="w-3 h-3" />
                            </button>
                            
                            {!notification.isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markAsRead([notification.id]); }}
                                className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Mark as read
                              </button>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); togglePin(notification.id); }}
                              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${notification.isPinned ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {notification.isPinned ? 'Unpin' : 'Pin'}
                            </button>

                            <div className="flex-1" />

                            {/* More Actions - Fixed for mobile touch */}
                            <div className="relative group/actions" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle dropdown visibility via state or CSS class
                                  const dropdown = e.currentTarget.nextElementSibling;
                                  if (dropdown) {
                                    dropdown.classList.toggle('opacity-0');
                                    dropdown.classList.toggle('invisible');
                                    dropdown.classList.toggle('opacity-100');
                                    dropdown.classList.toggle('visible');
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >
                                <MoreHorizontal className="w-5 h-5 pointer-events-none" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible transition-all z-50 group-hover/actions:opacity-100 group-hover/actions:visible sm:group-hover/actions:opacity-100 sm:group-hover/actions:visible data-[open=true]:opacity-100 data-[open=true]:visible">
                                <button
                                  onClick={(e) => { e.stopPropagation(); markAsUnread([notification.id]); }}
                                  className="w-full px-4 py-3 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 active:bg-gray-100"
                                >
                                  <Mail className="w-4 h-4" />
                                  Mark as unread
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); archiveNotifications([notification.id]); }}
                                  className="w-full px-4 py-3 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 active:bg-gray-100"
                                >
                                  <Archive className="w-4 h-4" />
                                  {notification.isArchived ? 'Unarchive' : 'Archive'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteNotifications([notification.id]); }}
                                  className="w-full px-4 py-3 sm:py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 active:bg-red-100"
                                >
                                  <Trash className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* GRID VIEW - Accella Style */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const Icon = notification.icon;
                const isSelected = selectedNotifications.includes(notification.id);
                const category = categories.find(c => c.id === notification.type);
                const isLast = index === filteredNotifications.length - 1;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    ref={isLast ? lastNotificationRef : null}
                    onClick={() => !selectMode && openModal(notification)}
                    className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden ${notification.isPinned ? 'ring-2 ring-orange-400' : ''} ${isSelected ? 'ring-2 ring-orange-500' : ''} ${notification.isArchived ? 'opacity-60' : ''} ${notification.priority === 'urgent' ? 'border-t-4 border-red-500' : notification.priority === 'high' ? 'border-t-4 border-orange-500' : 'border-t-4 border-gray-200'}`}
                  >
                    {/* Card Header Image/Gradient */}
                    <div className={`h-32 bg-gradient-to-br ${category?.gradient || 'from-gray-400 to-gray-600'} relative overflow-hidden`}>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                      </div>
                      
                      {/* Icon centered */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        {selectMode ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelection(notification.id); }}
                            className="w-6 h-6 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-white" />
                            ) : (
                              <Square className="w-4 h-4 text-white/70" />
                            )}
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-lg" />
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          {notification.isPinned && (
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                              <Pin className="w-4 h-4 text-white fill-current" />
                            </div>
                          )}
                          {notification.priority === 'urgent' && (
                            <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                              URGENT
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Category badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full`}>
                          {category?.label || notification.type}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                          {notification.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Metadata - Compact grid style */}
                      {notification.metadata && (
                        <div className="space-y-2 mb-4">
                          {notification.metadata.amount && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Amount</span>
                              <span className="font-bold text-emerald-600">{notification.metadata.amount}</span>
                            </div>
                          )}
                          {notification.metadata.orderId && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Order</span>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{notification.metadata.orderId}</span>
                            </div>
                          )}
                          {notification.metadata.eta && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">ETA</span>
                              <span className="flex items-center gap-1 text-violet-600 font-medium">
                                <Truck className="w-3 h-3" />
                                {notification.metadata.eta}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openModal(notification)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); togglePin(notification.id); }}
                            className={`p-2 rounded-lg transition-colors ${notification.isPinned ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            title={notification.isPinned ? 'Unpin' : 'Pin'}
                          >
                            {notification.isPinned ? <Pin className="w-4 h-4 fill-current" /> : <PinOff className="w-4 h-4" />}
                          </button>
                          <div className="relative group/actions">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible transition-all z-50">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markAsRead([notification.id]); }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); archiveNotifications([notification.id]); }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotifications([notification.id]); }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {filteredNotifications.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              Load More Notifications
            </button>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <NotificationModal />

      {/* Quick Actions Footer */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShoppingBag, label: 'My Orders', desc: 'Track & manage', url: '/orders', color: 'from-emerald-500 to-emerald-600' },
              { icon: Heart, label: 'Wishlist', desc: 'Saved items', url: '/wishlist', color: 'from-pink-500 to-pink-600' },
              { icon: MessageSquare, label: 'Messages', desc: 'Support chat', url: '/messages', color: 'from-indigo-500 to-indigo-600' },
              { icon: User, label: 'Profile', desc: 'Account settings', url: '/profile', color: 'from-blue-500 to-blue-600' }
            ].map((action) => (
              <a
                key={action.label}
                href={action.url}
                className="group p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{action.label}</h3>
                <p className="text-sm text-slate-300">{action.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;