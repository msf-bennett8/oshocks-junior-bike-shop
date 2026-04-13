<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Notification Templates
    |--------------------------------------------------------------------------
    |
    | Templates for different notification types. Each template supports
    | variable substitution using {{variable}} syntax.
    |
    */

    'templates' => [
        // Order Templates
        'order_placed' => [
            'title' => '🎉 Order Confirmed!',
            'message' => 'Your order {{order.number}} has been placed successfully. Total: {{order.amount}}',
            'action_text' => 'View Order',
            'priority' => 'high',
            'icon_type' => 'ShoppingBag',
            'icon_color' => 'text-emerald-600',
            'icon_bg' => 'bg-emerald-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'order_status_changed' => [
            'title' => '📦 Order Update',
            'message' => 'Order {{order.number}} status changed from {{old_status}} to {{new_status}}',
            'action_text' => 'Track Order',
            'priority' => 'high',
            'icon_type' => 'Package',
            'icon_color' => 'text-blue-600',
            'icon_bg' => 'bg-blue-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'order_shipped' => [
            'title' => '🚚 Order Shipped!',
            'message' => 'Your order {{order.number}} is on its way via {{carrier}}. Track: {{tracking_number}}',
            'action_text' => 'Track Delivery',
            'priority' => 'high',
            'icon_type' => 'Truck',
            'icon_color' => 'text-violet-600',
            'icon_bg' => 'bg-violet-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'order_out_for_delivery' => [
            'title' => '🚚 Out for Delivery',
            'message' => 'Order {{order.number}} is out for delivery. ETA: {{eta}}. Driver: {{driver_name}}',
            'action_text' => 'Live Track',
            'priority' => 'urgent',
            'icon_type' => 'Zap',
            'icon_color' => 'text-violet-600',
            'icon_bg' => 'bg-violet-100',
            'channels' => ['in_app', 'push', 'sms'],
        ],
        'order_delivered' => [
            'title' => '✅ Order Delivered',
            'message' => 'Your order {{order.number}} has been delivered. Enjoy your purchase!',
            'action_text' => 'View Order',
            'priority' => 'normal',
            'icon_type' => 'PackageCheck',
            'icon_color' => 'text-green-600',
            'icon_bg' => 'bg-green-100',
            'channels' => ['in_app', 'email'],
        ],
        'order_cancelled' => [
            'title' => '❌ Order Cancelled',
            'message' => 'Order {{order.number}} has been cancelled. Reason: {{reason}}',
            'action_text' => 'View Details',
            'priority' => 'high',
            'icon_type' => 'PackageX',
            'icon_color' => 'text-red-600',
            'icon_bg' => 'bg-red-100',
            'channels' => ['in_app', 'email'],
        ],

        // Payment Templates
        'payment_successful' => [
            'title' => '💰 Payment Successful',
            'message' => 'Payment of {{payment.amount}} for order {{order.number}} confirmed via {{payment.method}}',
            'action_text' => 'View Receipt',
            'priority' => 'high',
            'icon_type' => 'CreditCard',
            'icon_color' => 'text-green-600',
            'icon_bg' => 'bg-green-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'payment_failed' => [
            'title' => '❌ Payment Failed',
            'message' => 'Payment for order {{order.number}} failed: {{reason}}. Please try again.',
            'action_text' => 'Retry Payment',
            'priority' => 'urgent',
            'icon_type' => 'AlertCircle',
            'icon_color' => 'text-red-600',
            'icon_bg' => 'bg-red-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'payment_refunded' => [
            'title' => '💸 Refund Processed',
            'message' => 'Refund of {{amount}} for order {{order.number}} processed. Ref ID: {{refund_id}}',
            'action_text' => 'View Receipt',
            'priority' => 'high',
            'icon_type' => 'Wallet',
            'icon_color' => 'text-amber-600',
            'icon_bg' => 'bg-amber-100',
            'channels' => ['in_app', 'email'],
        ],

        // Inventory Templates
        'low_stock_alert' => [
            'title' => '⚠️ Low Stock Alert',
            'message' => '{{product.name}} (SKU: {{product.sku}}) is down to {{stock.current}} units (threshold: {{stock.threshold}})',
            'action_text' => 'Reorder Now',
            'priority' => 'urgent',
            'icon_type' => 'TrendingDown',
            'icon_color' => 'text-red-600',
            'icon_bg' => 'bg-red-100',
            'channels' => ['in_app', 'email'],
        ],
        'stock_running_low' => [
            'title' => '⚠️ Stock Running Low',
            'message' => '{{count}} products below reorder threshold. Review inventory report.',
            'action_text' => 'View Report',
            'priority' => 'high',
            'icon_type' => 'AlertTriangle',
            'icon_color' => 'text-orange-600',
            'icon_bg' => 'bg-orange-100',
            'channels' => ['in_app', 'email'],
        ],
        'back_in_stock' => [
            'title' => '📦 Back in Stock!',
            'message' => '{{product.name}} is back in stock with {{stock.quantity}} units available',
            'action_text' => 'Shop Now',
            'priority' => 'medium',
            'icon_type' => 'PackageCheck',
            'icon_color' => 'text-green-600',
            'icon_bg' => 'bg-green-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'new_product_arrival' => [
            'title' => '🆕 New Arrival',
            'message' => 'New: {{product.name}} - {{product.price}}. {{product.stock}} units in stock.',
            'action_text' => 'View Product',
            'priority' => 'medium',
            'icon_type' => 'Sparkles',
            'icon_color' => 'text-cyan-600',
            'icon_bg' => 'bg-cyan-100',
            'channels' => ['in_app', 'email'],
        ],

        // Price/Wishlist Templates
        'price_drop' => [
            'title' => '💸 Price Drop Alert!',
            'message' => '{{product.name}} dropped from {{price.old}} to {{price.new}} (Save {{price.percent}}%)',
            'action_text' => 'Buy Now',
            'priority' => 'medium',
            'icon_type' => 'TrendingDown',
            'icon_color' => 'text-green-600',
            'icon_bg' => 'bg-green-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'flash_sale' => [
            'title' => '⚡ Flash Sale!',
            'message' => '{{sale.percent}}% OFF {{sale.products}} items! Ends in {{sale.ends}}',
            'action_text' => 'Shop Sale',
            'priority' => 'high',
            'icon_type' => 'Zap',
            'icon_color' => 'text-orange-600',
            'icon_bg' => 'bg-orange-100',
            'channels' => ['in_app', 'push', 'email'],
        ],

        // Loyalty/Promotion Templates
        'loyalty_tier_changed' => [
            'title' => '🎁 Loyalty Status Upgraded!',
            'message' => 'You\'ve earned {{tier.new}} status! Enjoy {{benefits}} for {{duration}}',
            'action_text' => 'View Benefits',
            'priority' => 'medium',
            'icon_type' => 'Star',
            'icon_color' => 'text-yellow-600',
            'icon_bg' => 'bg-yellow-100',
            'channels' => ['in_app', 'email'],
        ],

        // Security Templates
        'security_alert' => [
            'title' => '🔒 Security Alert',
            'message' => '{{alert.description}}. If this wasn\'t you, please secure your account.',
            'action_text' => 'Review Activity',
            'priority' => 'urgent',
            'icon_type' => 'Shield',
            'icon_color' => 'text-red-600',
            'icon_bg' => 'bg-red-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'login_failed' => [
            'title' => '⚠️ Failed Login Attempts',
            'message' => '{{count}} failed login attempts detected from IP {{ip}}. Account temporarily locked.',
            'action_text' => 'Review Security',
            'priority' => 'urgent',
            'icon_type' => 'AlertTriangle',
            'icon_color' => 'text-red-600',
            'icon_bg' => 'bg-red-100',
            'channels' => ['in_app', 'email', 'push'],
        ],

        // Audit/Admin Templates
        'audit_alert' => [
            'title' => '📋 {{event.type}} Detected',
            'message' => '{{event.description}}. Review audit log for details.',
            'action_text' => 'View Audit',
            'priority' => 'high',
            'icon_type' => 'FileText',
            'icon_color' => 'text-slate-600',
            'icon_bg' => 'bg-slate-100',
            'channels' => ['in_app', 'email'],
        ],
        'mass_purchase_alert' => [
            'title' => '🎉 Mass Purchase Confirmed!',
            'message' => 'Corporate order {{order.number}}: {{order.items}} items, {{order.amount}}. {{customer.type}}',
            'action_text' => 'Manage Order',
            'priority' => 'urgent',
            'icon_type' => 'Users',
            'icon_color' => 'text-emerald-600',
            'icon_bg' => 'bg-emerald-100',
            'channels' => ['in_app', 'email'],
        ],
        'bulk_operation_alert' => [
            'title' => '⚠️ Bulk {{operation.type}} Detected',
            'message' => '{{operation.count}} items affected by {{operation.user}}. Reason: {{operation.reason}}',
            'action_text' => 'Review Changes',
            'priority' => 'high',
            'icon_type' => 'BarChart3',
            'icon_color' => 'text-orange-600',
            'icon_bg' => 'bg-orange-100',
            'channels' => ['in_app', 'email'],
        ],
        'system_maintenance' => [
            'title' => '🔧 System Maintenance',
            'message' => 'Scheduled: {{maintenance.start}} to {{maintenance.end}}. {{services}} unavailable.',
            'action_text' => 'Details',
            'priority' => 'urgent',
            'icon_type' => 'Megaphone',
            'icon_color' => 'text-cyan-600',
            'icon_bg' => 'bg-cyan-100',
            'channels' => ['in_app', 'email', 'push'],
        ],

        // Support/Message Templates
        'support_message' => [
            'title' => '💬 {{message.subject}}',
            'message' => '{{message.preview}}',
            'action_text' => 'Reply',
            'priority' => 'medium',
            'icon_type' => 'MessageSquare',
            'icon_color' => 'text-indigo-600',
            'icon_bg' => 'bg-indigo-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
        'delivery_issue' => [
            'title' => '🚨 Delivery Issue: {{issue.type}}',
            'message' => 'Driver {{driver.name}} reports: {{issue.description}}. Attempt {{attempt.current}}/{{attempt.max}}',
            'action_text' => 'Respond',
            'priority' => 'urgent',
            'icon_type' => 'AlertCircle',
            'icon_color' => 'text-red-600',
            'icon_bg' => 'bg-red-100',
            'channels' => ['in_app', 'push', 'sms'],
        ],
        'pickup_ready' => [
            'title' => '📦 Ready for Pickup',
            'message' => 'Order {{order.number}} ready at {{store.name}}. Code: {{pickup.code}}',
            'action_text' => 'Directions',
            'priority' => 'high',
            'icon_type' => 'Store',
            'icon_color' => 'text-emerald-600',
            'icon_bg' => 'bg-emerald-100',
            'channels' => ['in_app', 'email', 'push'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limits' => [
        'max_per_day' => env('NOTIFICATION_MAX_PER_DAY', 100),
        'max_push_per_hour' => env('NOTIFICATION_MAX_PUSH_PER_HOUR', 10),
        'max_sms_per_day' => env('NOTIFICATION_MAX_SMS_PER_DAY', 5),
        'max_email_per_hour' => env('NOTIFICATION_MAX_EMAIL_PER_HOUR', 20),
        'burst_limit' => env('NOTIFICATION_BURST_LIMIT', 5), // per minute
    ],

    /*
    |--------------------------------------------------------------------------
    | Cleanup Settings
    |--------------------------------------------------------------------------
    */
    'cleanup' => [
        'soft_delete_after_days' => 30,
        'archive_after_days' => 90,
        'hard_delete_after_days' => 365,
        'push_subscription_stale_days' => 90,
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Preferences
    |--------------------------------------------------------------------------
    */
    'default_preferences' => [
        'channels' => [
            'push' => true,
            'email' => true,
            'sms' => false,
            'in_app' => true,
        ],
        'quiet_hours' => [
            'enabled' => false,
            'start' => '22:00',
            'end' => '07:00',
        ],
    ],
];
