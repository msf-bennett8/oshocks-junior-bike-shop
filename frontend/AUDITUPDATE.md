## FRONTEND BATCH 1: Core Infrastructure & Auth (Phases 1, 4, 5)
Maps to: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, SESSION_REVOKED, PASSWORD_CHANGED, PASSWORD_RESET_, TWO_FACTOR_, ACCOUNT_, EMAIL_, PROFILE_UPDATED, API_KEY_, etc.*


cat frontend/src/utils/auditUtils.js frontend/src/hooks/useAudit.js frontend/src/hooks/useDeviceFingerprint.js frontend/src/context/AuthContext.js frontend/src/pages/auth/LoginPage.js frontend/src/pages/auth/ForgotPasswordPage.js frontend/src/pages/auth/ResetPasswordPage.js frontend/src/pages/auth/GoogleCallback.jsx frontend/src/pages/auth/StravaCallback.jsx frontend/src/App.js
Backend Events to Verify (35 events):



## Phase	Events
1 - Auth	LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, SESSION_REVOKED, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED, PASSWORD_RESET_FAILED, TWO_FACTOR_ENABLED, TWO_FACTOR_DISABLED, TWO_FACTOR_CHALLENGE, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, SUSPICIOUS_ACTIVITY_DETECTED
4 - User Data	ACCOUNT_CREATED, EMAIL_VERIFICATION_SENT, EMAIL_VERIFIED, PROFILE_UPDATED, EMAIL_CHANGED, PHONE_CHANGED, ACCOUNT_DEACTIVATED, ACCOUNT_REACTIVATED, ACCOUNT_DELETED
5 - API	API_KEY_CREATED, API_KEY_ROTATED, API_KEY_REVOKED, API_REQUEST_RECEIVED, API_RATE_LIMIT_TRIGGERED
FRONTEND BATCH 2: Admin & SuperAdmin Management (Phases 3, 4, 7)
Maps to: USER_ROLE_CHANGED, PERMISSIONS_UPDATED, ADMIN_IMPERSONATION_, PRODUCT_, INVENTORY_, ORDER_STATUS_MANUALLY_CHANGED, RESOURCE_, PRIVILEGED_QUERY_, etc.*



cat frontend/src/pages/admin/AdminDashboardPage.js frontend/src/pages/admin/AdminUsersPage.js frontend/src/pages/admin/ManageUsers.js frontend/src/pages/admin/AdminOrdersPage.js frontend/src/pages/admin/AdminProductsPage.js frontend/src/pages/admin/AdminCategoriesPage.js frontend/src/pages/admin/AdminAddProductFormModal.js frontend/src/pages/superadmin/SuperAdminDashboardPage.js frontend/src/pages/superadmin/SuperAdminUsersPage.js frontend/src/pages/superadmin/SuperAdminManageUsers.js frontend/src/pages/superadmin/SuperAdminOrdersPage.js frontend/src/pages/superadmin/SuperAdminProductsPage.js frontend/src/pages/superadmin/SuperAdminCategoriesPage.js frontend/src/pages/superadmin/SuperAdminAddProductFormModal.js frontend/src/components/impersonator/ImpersonationBanner.js
Backend Events to Verify (26 events):



## Phase	Events
3 - Admin	USER_ROLE_CHANGED, PERMISSIONS_UPDATED, ADMIN_IMPERSONATION_STARTED, ADMIN_IMPERSONATION_ENDED, PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED, PRODUCT_PRICE_MODIFIED, BULK_PRODUCT_PRICE_UPDATED, INVENTORY_UPDATED, INVENTORY_AUTO_ADJUSTED, INVENTORY_LOW_THRESHOLD_TRIGGERED, INVENTORY_TRANSFER_INITIATED, INVENTORY_TRANSFER_COMPLETED, ORDER_STATUS_MANUALLY_CHANGED
7 - Security	RESOURCE_ACCESSED, RESOURCE_ACCESS_DENIED, PRIVILEGED_QUERY_EXECUTED, PRIVILEGED_QUERY_BLOCKED, VELOCITY_CHECK_TRIGGERED, DEVICE_FINGERPRINT_CREATED, DEVICE_FINGERPRINT_MISMATCH, DEVICE_TRUSTED, SUSPICIOUS_IP_DETECTED, GEOLOCATION_ANOMALY, DATA_EXFILTRATION_ATTEMPT
FRONTEND BATCH 3: Seller Operations (Phases 2, 3, 10)
Maps to: PRODUCT_, INVENTORY_, ORDER_, SERVICE_, REVIEW_, WISHLIST_, etc.



cat frontend/src/pages/seller/SellerDashboardPage.js frontend/src/pages/seller/SellerOrdersPage.js frontend/src/pages/seller/SellerProductsPage.js frontend/src/pages/seller/AddProductPage.js frontend/src/pages/seller/SellerSettingsPage.js frontend/src/pages/seller/AddProductFormPage.js frontend/src/pages/seller/EditProductPage.js frontend/src/pages/seller/ManageProducts.js frontend/src/pages/seller/OrderManagement.js
Backend Events to Verify (20 events):



## Phase	Events
2 - Order	ORDER_PLACED, ORDER_FAILED, ORDER_PAYMENT_PENDING, ORDER_PAYMENT_PROCESSING, ORDER_STATUS_CHANGED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED, ORDER_RETURN_REQUESTED, ORDER_RETURN_APPROVED, ORDER_RETURN_RECEIVED, ORDER_RETURN_COMPLETED
3 - Admin	PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED, INVENTORY_UPDATED
10 - Business	SERVICE_BOOKED, SERVICE_RESCHEDULED, SERVICE_COMPLETED, SERVICE_CANCELLED, SERVICE_NO_SHOW, REVIEW_SUBMITTED, REVIEW_MODERATED, REVIEW_EDITED, REVIEW_DELETED, REVIEW_HELPFUL_MARKED, WISHLIST_ITEM_ADDED, WISHLIST_ITEM_REMOVED, PRODUCT_VIEWED
FRONTEND BATCH 4: User Account & Profile (Phases 2, 4, 8, 10)
Maps to: CART_, CHECKOUT_, ORDER_, ADDRESS_, CONSENT_, PRIVACY_, NOTIFICATION_, WISHLIST_, etc.



cat frontend/src/pages/user/UserDashboardPage.js frontend/src/pages/user/UserProfilePage.js frontend/src/pages/user/OrdersPage.js frontend/src/pages/user/OrderHistory.js frontend/src/pages/user/OrderDetailsPage.js frontend/src/pages/user/AddressesPage.js frontend/src/pages/user/SettingsPage.js frontend/src/pages/profile/ProfilePage.js frontend/src/context/CartContext.js
Backend Events to Verify (32 events):



## Phase	Events
2 - Order	CART_CREATED, CART_ITEM_ADDED, CART_ITEM_REMOVED, CART_ABANDONED, CHECKOUT_STEP_STARTED, CHECKOUT_STEP_COMPLETED, CHECKOUT_STEP_ABANDONED, INVENTORY_RESERVED, INVENTORY_RESERVATION_EXPIRED, INVENTORY_RELEASED
4 - User Data	ADDRESS_ADDED, ADDRESS_UPDATED, ADDRESS_DELETED, DATA_EXPORT_REQUESTED, DATA_EXPORT_GENERATED, DATA_EXPORT_DOWNLOADED, DATA_EXPORT_EXPIRED, CONSENT_GIVEN, CONSENT_WITHDRAWN, CONSENT_PREFERENCES_EXPORTED, PRIVACY_REQUEST_RECEIVED, PRIVACY_REQUEST_ACKNOWLEDGED, PRIVACY_REQUEST_FULFILLED, PRIVACY_REQUEST_REJECTED, DATA_TRANSFERRED_CROSS_BORDER, AUTOMATED_DECISION_MADE, AUTOMATED_DECISION_CONTESTED, AUTOMATED_DECISION_REVIEWED
8 - Notifications	NOTIFICATION_CREATED, NOTIFICATION_SENT, NOTIFICATION_DELIVERED, NOTIFICATION_OPENED, NOTIFICATION_CLICKED, NOTIFICATION_DELETED, NOTIFICATION_SETTINGS_CHANGED, CHANNEL_PREFERENCES_UPDATED, QUIET_HOURS_TOGGLED, DESKTOP_NOTIFICATIONS_TOGGLED
10 - Business	WISHLIST_ITEM_ADDED, WISHLIST_ITEM_REMOVED
FRONTEND BATCH 5: Checkout & Payments (Phases 2 - Financial)
Maps to: PAYMENT_, CHARGEBACK_, REFUND_, POINTS_, etc.



cat frontend/src/pages/checkout/CheckoutPage.js frontend/src/pages/checkout/CheckoutForm.js frontend/src/pages/checkout/OrderSuccessPage.js frontend/src/pages/checkout/OrderSummary.js frontend/src/pages/checkout/PaymentMethod.js frontend/src/pages/checkout/PaymentCallback.jsx frontend/src/pages/payment/PaystackPayment.jsx frontend/src/pages/payment/PaymentMethod.js frontend/src/pages/payout/PayoutManagementPage.js frontend/src/pages/recorder/RecordPaymentPage.jsx frontend/src/pages/recorder/OrderDetailsPage.jsx frontend/src/pages/recorder/RecorderDashboard.jsx
Backend Events to Verify (20 events):

## Phase	Events
2 - Financial	PAYMENT_METHOD_ADDED, PAYMENT_METHOD_REMOVED, PAYMENT_METHOD_DEFAULT_CHANGED, PAYMENT_INTENT_CREATED, PAYMENT_SUCCESSFUL, PAYMENT_FAILED, PAYMENT_RETRIED, PAYMENT_DISPUTE_OPENED, PAYMENT_DISPUTE_UPDATED, PAYMENT_DISPUTE_RESOLVED, CHARGEBACK_RECEIVED, CHARGEBACK_CONTESTED, CHARGEBACK_RESOLVED, REFUND_REQUESTED, REFUND_PROCESSED, PARTIAL_REFUND_PROCESSED, REFUND_REJECTED, POINTS_EARNED, POINTS_REDEEMED, POINTS_EXPIRED, POINTS_ADJUSTED
FRONTEND BATCH 6: Product Discovery & Marketing (Phases 9, 10)
Maps to: MARKETING_, SMS_, PUSH_, LOYALTY_, REFERRAL_, PRODUCT_VIEWED, etc.*


cat frontend/src/pages/product/ProductDetailsPage.js frontend/src/pages/product/ProductList.js frontend/src/pages/product/ProductSearch.js frontend/src/pages/product/NewArrival.js frontend/src/pages/product/ClearanceSale.js frontend/src/pages/product/SpecialOffer.js frontend/src/pages/product/SparePartsAndAccessories.js frontend/src/pages/main/LoyaltyPage.js frontend/src/pages/main/NotificationsPage.js frontend/src/pages/notifications/NotificationCenter.js frontend/src/components/CookieConsent.js
Backend Events to Verify (15 events):



## Phase	Events
9 - Marketing	MARKETING_EMAIL_SENT, MARKETING_EMAIL_DELIVERED, MARKETING_EMAIL_OPENED, MARKETING_EMAIL_CLICKED, MARKETING_EMAIL_BOUNCED, MARKETING_EMAIL_COMPLAINED, MARKETING_EMAIL_UNSUBSCRIBED, SMS_DELIVERED, SMS_FAILED, PUSH_NOTIFICATION_SENT, PUSH_NOTIFICATION_DELIVERED
10 - Business	LOYALTY_TIER_CHANGED, REFERRAL_CODE_GENERATED, REFERRAL_COMPLETED, PRODUCT_VIEWED
FRONTEND BATCH 7: Error Pages & System Health (Phases 6, 7)
Maps to: DATABASE_, SCHEDULED_JOB_, CACHE_, SECURITY_, etc.



cat frontend/src/pages/errors/NotFoundPage.js frontend/src/pages/errors/ServerErrorPage.js frontend/src/pages/errors/DatabaseErrorPage.js frontend/src/pages/errors/UnauthorizedPage.js frontend/src/pages/errors/ForbiddenPage.js frontend/src/pages/errors/RateLimitExceededPage.js frontend/src/pages/errors/SessionTimeoutPage.js frontend/src/pages/errors/PaymentFailedPage.js frontend/src/pages/errors/MaintenancePage.js frontend/src/pages/errors/OfflinePage.js frontend/src/components/common/ErrorBoundary.js
Backend Events to Verify (10 events):



## Phase	Events
6 - System Health	DATABASE_BACKUP_STARTED, DATABASE_BACKUP_COMPLETED, DATABASE_BACKUP_FAILED, DATABASE_RESTORE_REQUESTED, DATABASE_RESTORE_COMPLETED, SCHEDULED_JOB_STARTED, SCHEDULED_JOB_COMPLETED, SCHEDULED_JOB_FAILED, SCHEDULED_JOB_TIMEOUT, CACHE_INVALIDATION, CACHE_WARMUP_COMPLETED, SEARCH_INDEX_UPDATED
FRONTEND BATCH 8: API & Webhook Integrations (Phase 5)
Maps to: WEBHOOK_, THIRD_PARTY_INTEGRATION_, etc.



cat frontend/src/services/api.js frontend/src/services/auditService.js frontend/src/services/authService.js frontend/src/services/paymentService.js frontend/src/services/orderService.js frontend/src/services/productService.js frontend/src/services/recorder/recorderService.js frontend/src/utils/constants.js frontend/src/utils/helpers.js frontend/src/utils/validators.js
Backend Events to Verify (10 events):



## Phase 8	Events
5 - API & Integrations	WEBHOOK_SUBSCRIPTION_CREATED, WEBHOOK_DELIVERED, WEBHOOK_FAILED, WEBHOOK_RETRY_SCHEDULED, WEBHOOK_DISABLED, THIRD_PARTY_INTEGRATION_ERROR, THIRD_PARTY_INTEGRATION_RECOVERY
COMPARISON CHECKLIST TEMPLATE
For each batch, verify:
Markdown
Code
Preview
## BATCH [X]: [Name] Verification

### Backend Events Expected: [Count]
[List events from above]

### Frontend Implementation Status:

| Event | Frontend File | Implementation | Status | Notes |
|-------|--------------|----------------|--------|-------|
| LOGIN_SUCCESS | AuthContext.js | useAudit().logAuth() | ✅/❌ | |
| ... | ... | ... | ... | ... |

### Critical Checks:
- [ ] All expected events have frontend logging calls
- [ ] Correct severity levels used (critical/high/medium/low)
- [ ] Proper metadata structure (actor_id, entity_type, entity_id, etc.)
- [ ] Device fingerprint included where required
- [ ] Correlation ID passed in headers
- [ ] Error handling doesn't expose sensitive data
- [ ] Async logging doesn't block UI

### Gaps Found:
1. [Event] - [File] - [Issue] - [Recommended Fix]

### Alignment Score: [X]/[Total] ([%]%) 









## PROMPT FOR BATCH 1: Core Infrastructure & Auth
(Use with: auditUtils.js, useAudit.js, useDeviceFingerprint.js, AuthContext.js, LoginPage.js, ForgotPasswordPage.js, ResetPasswordPage.js, GoogleCallback.jsx, StravaCallback.jsx, App.js)
Markdown
Code
Preview
Verify frontend audit logging implementation for AUTHENTICATION & CORE INFRASTRUCTURE against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 35 events across Phase 1 (Auth), Phase 4 (User Data), Phase 5 (API):

### Phase 1 - Auth & Security (14 events):
LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, SESSION_REVOKED, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED, PASSWORD_RESET_FAILED, TWO_FACTOR_ENABLED, TWO_FACTOR_DISABLED, TWO_FACTOR_CHALLENGE, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, SUSPICIOUS_ACTIVITY_DETECTED

### Phase 4 - User Data (11 events):
ACCOUNT_CREATED, EMAIL_VERIFICATION_SENT, EMAIL_VERIFIED, PROFILE_UPDATED, EMAIL_CHANGED, PHONE_CHANGED, ACCOUNT_DEACTIVATED, ACCOUNT_REACTIVATED, ACCOUNT_DELETED

### Phase 5 - API & Integrations (10 events):
API_KEY_CREATED, API_KEY_ROTATED, API_KEY_REVOKED, API_REQUEST_RECEIVED, API_RATE_LIMIT_TRIGGERED

## VERIFICATION TASK

Check the frontend files and verify:

1. **EVENT COVERAGE**: Which of the 35 backend events are logged from frontend?
   - List events found with file location and line number
   - List events MISSING that should be implemented

2. **IMPLEMENTATION QUALITY** for each event found:
   - Does it use `useAudit()` hook or `auditUtils`?
   - Does it include: actor_id, actor_type, timestamp, ip_address, device_info, session_id?
   - Does it pass `X-Correlation-ID` header in API calls?
   - Does it capture `failure_count` for repeated failures (brute-force tracking)?
   - Does it capture `failure_reason` for failed events?

3. **DEVICE FINGERPRINTING**:
   - Is `useDeviceFingerprint()` used on login attempts?
   - Is fingerprint passed to backend in audit logs?

4. **SEVERITY MAPPING**:
   - LOGIN_FAILED → high/critical?
   - PASSWORD_RESET_FAILED → high?
   - SUSPICIOUS_ACTIVITY_DETECTED → critical?

5. **SECURITY EVENTS**:
   - Are ACCOUNT_LOCKED/UNLOCKED events triggered on failed attempt thresholds?
   - Is SUSPICIOUS_ACTIVITY_DETECTED called for unusual patterns?

## OUTPUT FORMAT

| Event Name | File | Line | Status | Missing Fields | Notes |
|-----------|------|------|--------|---------------|-------|
| LOGIN_SUCCESS | AuthContext.js | 45 | ✅ | None | Uses useAudit() |
| ... | ... | ... | ... | ... | ... |

**Missing Events**: [List]
**Critical Gaps**: [List]
**Recommendations**: [List specific fixes]
PROMPT FOR BATCH 2: Admin & SuperAdmin Management
(Use with: Admin/SuperAdmin dashboard, users, orders, products, categories pages + ImpersonationBanner)
Markdown
Code
Preview
Verify frontend audit logging implementation for ADMIN & SUPERADMIN FUNCTIONS against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 26 events across Phase 3 (Admin), Phase 7 (Security):

### Phase 3 - Admin & System Control (15 events):
USER_ROLE_CHANGED, PERMISSIONS_UPDATED, ADMIN_IMPERSONATION_STARTED, ADMIN_IMPERSONATION_ENDED, PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED, PRODUCT_PRICE_MODIFIED, BULK_PRODUCT_PRICE_UPDATED, INVENTORY_UPDATED, INVENTORY_AUTO_ADJUSTED, INVENTORY_LOW_THRESHOLD_TRIGGERED, INVENTORY_TRANSFER_INITIATED, INVENTORY_TRANSFER_COMPLETED, ORDER_STATUS_MANUALLY_CHANGED

### Phase 7 - Security Monitoring (11 events):
RESOURCE_ACCESSED, RESOURCE_ACCESS_DENIED, PRIVILEGED_QUERY_EXECUTED, PRIVILEGED_QUERY_BLOCKED, VELOCITY_CHECK_TRIGGERED, DEVICE_FINGERPRINT_CREATED, DEVICE_FINGERPRINT_MISMATCH, DEVICE_TRUSTED, SUSPICIOUS_IP_DETECTED, GEOLOCATION_ANOMALY, DATA_EXFILTRATION_ATTEMPT

## VERIFICATION TASK

Check the frontend files and verify:

1. **ADMIN IMPERSONATION** (Critical Security):
   - Is ADMIN_IMPERSONATION_STARTED logged when impersonation begins?
   - Is ADMIN_IMPERSONATION_ENDED logged with duration_seconds?
   - Does ImpersonationBanner.js capture actions_taken_summary?
   - Is impersonation_token tracked?

2. **USER MANAGEMENT**:
   - USER_ROLE_CHANGED: Captured on role dropdown change?
   - PERMISSIONS_UPDATED: Captured with permissions_added/removed JSON?
   - Are changes logged BEFORE API call (optimistic) or AFTER (confirmed)?

3. **PRODUCT MANAGEMENT**:
   - PRODUCT_CREATED: Full initial_data JSON captured?
   - PRODUCT_UPDATED: Changes diff captured (old_values/new_values)?
   - PRODUCT_PRICE_MODIFIED: % change calculated and logged?
   - BULK_PRODUCT_PRICE_UPDATED: Affected count captured?

4. **ORDER MANAGEMENT**:
   - ORDER_STATUS_MANUALLY_CHANGED: reason and customer_notified captured?
   - Is manual change distinguishable from system changes?

5. **SECURITY MONITORING**:
   - RESOURCE_ACCESSED: Logged on sensitive data views (orders, payments)?
   - RESOURCE_ACCESS_DENIED: Logged on permission failures?
   - VELOCITY_CHECK_TRIGGERED: Handled when APIs return 429?
   - DATA_EXFILTRATION_ATTEMPT: Detected on bulk export attempts?

6. **METADATA STANDARDS**:
   - on_behalf_of field set when admin acts for user?
   - changed_by field populated with actual admin user_id?

## OUTPUT FORMAT

| Event Name | File | Trigger | Status | Gap |
|-----------|------|---------|--------|------|
| ADMIN_IMPERSONATION_STARTED | SuperAdminUsersPage.js | Start button | ✅/❌ | ... |

**Critical Security Gaps**: [List - impersonation is high priority]
**Data Completeness Issues**: [List missing fields]
PROMPT FOR BATCH 3: Seller Operations
(Use with: Seller dashboard, orders, products, add/edit product pages)
Markdown
Code
Preview
Verify frontend audit logging implementation for SELLER OPERATIONS against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 20 events across Phase 2 (Order), Phase 3 (Admin), Phase 10 (Business):

### Phase 2 - Order Lifecycle (12 events):
ORDER_PLACED, ORDER_FAILED, ORDER_PAYMENT_PENDING, ORDER_PAYMENT_PROCESSING, ORDER_STATUS_CHANGED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED, ORDER_RETURN_REQUESTED, ORDER_RETURN_APPROVED, ORDER_RETURN_RECEIVED, ORDER_RETURN_COMPLETED

### Phase 3 - Admin (4 events):
PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED, INVENTORY_UPDATED

### Phase 10 - Business (4 events):
SERVICE_BOOKED, SERVICE_RESCHEDULED, SERVICE_COMPLETED, SERVICE_CANCELLED, SERVICE_NO_SHOW, REVIEW_SUBMITTED, REVIEW_MODERATED, REVIEW_EDITED, REVIEW_DELETED, REVIEW_HELPFUL_MARKED, WISHLIST_ITEM_ADDED, WISHLIST_ITEM_REMOVED, PRODUCT_VIEWED

## VERIFICATION TASK

Check the frontend files and verify:

1. **PRODUCT MANAGEMENT**:
   - PRODUCT_CREATED: Initial data JSON includes all fields?
   - PRODUCT_UPDATED: Diff properly calculated for changes?
   - INVENTORY_UPDATED: adjustment, reason, location_id captured?

2. **ORDER MANAGEMENT**:
   - ORDER_STATUS_CHANGED: Triggered when seller updates order status?
   - ORDER_SHIPPED: tracking_number, carrier, service_level captured?
   - ORDER_CANCELLED: reason, refund_initiated, inventory_released?
   - ORDER_RETURN_*: Full return lifecycle tracked?

3. **REVIEW MANAGEMENT**:
   - REVIEW_SUBMITTED: verified_purchase flag set?
   - REVIEW_MODERATED: moderation_action and automated flag?
   - REVIEW_EDITED: edit_count incremented?

4. **SELLER-SPECIFIC FIELDS**:
   - Is seller_id captured as actor_id or on_behalf_of?
   - Are seller actions distinguishable from admin actions?

5. **MISSING EVENTS**:
   - SERVICE_* events (if seller provides services)?
   - WISHLIST_* events on seller products?

## OUTPUT FORMAT

| Event Category | Events Found | Events Missing | Implementation Quality |
|---------------|-------------|---------------|----------------------|
| Product | ... | ... | ... |
| Order | ... | ... | ... |
| Review | ... | ... | ... |

**Seller-Specific Gaps**: [List]
PROMPT FOR BATCH 4: User Account & Profile
(Use with: User dashboard, profile, orders, addresses, settings, CartContext.js)
Markdown
Code
Preview
Verify frontend audit logging implementation for USER ACCOUNT & PROFILE against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 32 events across Phase 2 (Order), Phase 4 (User Data), Phase 8 (Notifications), Phase 10 (Business):

### Phase 2 - Order (10 events):
CART_CREATED, CART_ITEM_ADDED, CART_ITEM_REMOVED, CART_ABANDONED, CHECKOUT_STEP_STARTED, CHECKOUT_STEP_COMPLETED, CHECKOUT_STEP_ABANDONED, INVENTORY_RESERVED, INVENTORY_RESERVATION_EXPIRED, INVENTORY_RELEASED

### Phase 4 - User Data (17 events):
ADDRESS_ADDED, ADDRESS_UPDATED, ADDRESS_DELETED, DATA_EXPORT_REQUESTED, DATA_EXPORT_GENERATED, DATA_EXPORT_DOWNLOADED, DATA_EXPORT_EXPIRED, CONSENT_GIVEN, CONSENT_WITHDRAWN, CONSENT_PREFERENCES_EXPORTED, PRIVACY_REQUEST_RECEIVED, PRIVACY_REQUEST_ACKNOWLEDGED, PRIVACY_REQUEST_FULFILLED, PRIVACY_REQUEST_REJECTED, DATA_TRANSFERRED_CROSS_BORDER, AUTOMATED_DECISION_MADE, AUTOMATED_DECISION_CONTESTED, AUTOMATED_DECISION_REVIEWED

### Phase 8 - Notifications (10 events):
NOTIFICATION_CREATED, NOTIFICATION_SENT, NOTIFICATION_DELIVERED, NOTIFICATION_OPENED, NOTIFICATION_CLICKED, NOTIFICATION_DELETED, NOTIFICATION_SETTINGS_CHANGED, CHANNEL_PREFERENCES_UPDATED, QUIET_HOURS_TOGGLED, DESKTOP_NOTIFICATIONS_TOGGLED

### Phase 10 - Business (2 events):
WISHLIST_ITEM_ADDED, WISHLIST_ITEM_REMOVED

## VERIFICATION TASK

Check the frontend files and verify:

1. **CART & CHECKOUT** (Critical):
   - CART_CREATED: source tracked (direct/wishlist/abandoned_recovery)?
   - CART_ITEM_ADDED/REMOVED: SKU, quantity, unit_price captured?
   - CART_ABANDONED: abandonment_duration, recovery_email_sent?
   - CHECKOUT_STEP_*: Full funnel tracking with time_spent_seconds?
   - INVENTORY_RESERVED: reservation_token captured?

2. **ADDRESSES**:
   - ADDRESS_ADDED/UPDATED/DELETED: address_type (shipping/billing)?

3. **PRIVACY & COMPLIANCE** (GDPR):
   - CONSENT_GIVEN: consent_type, version, CMP ID?
   - CONSENT_WITHDRAWN: withdrawal_method captured?
   - DATA_EXPORT_REQUESTED: export_type, formats, deadline?
   - PRIVACY_REQUEST_*: Full lifecycle tracked?
   - AUTOMATED_DECISION_*: GDPR Article 22 compliance?

4. **NOTIFICATIONS**:
   - NOTIFICATION_OPENED/CLICKED: device_type, clicked_url?
   - NOTIFICATION_SETTINGS_CHANGED: old_value/new_value diff?
   - CHANNEL_PREFERENCES_UPDATED: full channels JSON?

5. **WISHLIST**:
   - WISHLIST_ITEM_ADDED/REMOVED: Tracked via WishlistContext?

## OUTPUT FORMAT

| Phase | Event Count Expected | Event Count Found | Coverage % |
|-------|---------------------|-------------------|------------|
| Cart/Checkout | 10 | ? | ?% |
| Privacy/GDPR | 17 | ? | ?% |
| Notifications | 10 | ? | ?% |
| Wishlist | 2 | ? | ?% |

**GDPR Compliance Gaps**: [Critical for legal]
**Cart Abandonment Tracking**: [Marketing priority]
PROMPT FOR BATCH 5: Checkout & Payments
(Use with: Checkout pages, Payment components, Payout pages, Recorder pages)
Markdown
Code
Preview
Verify frontend audit logging implementation for PAYMENTS & FINANCIAL against backend specification.

## BACKEND REFERENCE (Verified Complete - TIER_1 IMMUTABLE)
Backend implements 20 events across Phase 2 - Financial (PCI DSS Critical):

PAYMENT_METHOD_ADDED, PAYMENT_METHOD_REMOVED, PAYMENT_METHOD_DEFAULT_CHANGED, PAYMENT_INTENT_CREATED, PAYMENT_SUCCESSFUL, PAYMENT_FAILED, PAYMENT_RETRIED, PAYMENT_DISPUTE_OPENED, PAYMENT_DISPUTE_UPDATED, PAYMENT_DISPUTE_RESOLVED, CHARGEBACK_RECEIVED, CHARGEBACK_CONTESTED, CHARGEBACK_RESOLVED, REFUND_REQUESTED, REFUND_PROCESSED, PARTIAL_REFUND_PROCESSED, REFUND_REJECTED, POINTS_EARNED, POINTS_REDEEMED, POINTS_EXPIRED, POINTS_ADJUSTED

## VERIFICATION TASK

Check the frontend files and verify:

1. **PAYMENT METHODS** (PCI DSS Req 10):
   - PAYMENT_METHOD_ADDED: last_four_digits, expiry, billing_address_id?
   - PAYMENT_METHOD_REMOVED: Properly logged for compliance?
   - PAYMENT_METHOD_DEFAULT_CHANGED: old_default_id/new_default_id?

2. **PAYMENT LIFECYCLE**:
   - PAYMENT_INTENT_CREATED: Stripe-style flow tracked?
   - PAYMENT_SUCCESSFUL: transaction_id, settlement_date?
   - PAYMENT_FAILED: failure_reason, processor_error_code, retryable?
   - PAYMENT_RETRIED: attempt_number tracked?

3. **DISPUTES & CHARGEBACKS**:
   - PAYMENT_DISPUTE_*: Full dispute lifecycle tracked?
   - CHARGEBACK_*: evidence_submitted_at, representment_eligible?

4. **REFUNDS**:
   - REFUND_REQUESTED: reason, requested_by?
   - REFUND_PROCESSED: transaction_id, processed_by?
   - PARTIAL_REFUND_PROCESSED: remaining_order_value?

5. **LOYALTY/POINTS**:
   - POINTS_EARNED: source, expiry_date?
   - POINTS_REDEEMED: reward_type, order_id?
   - POINTS_ADJUSTED: adjustment_type (manual/system)?

6. **PCI DSS COMPLIANCE CHECKS**:
   - Are card numbers NEVER logged (only last_four)?
   - Are tokens hashed properly?
   - Is settlement_date captured for reconciliation?

## OUTPUT FORMAT

| Event | PCI Critical | Implemented | Data Complete | Notes |
|-------|-------------|-------------|---------------|-------|
| PAYMENT_SUCCESSFUL | ✅ | ✅/❌ | ✅/❌ | ... |

**PCI DSS Gaps**: [Critical - must fix]
**Financial Audit Trail Complete**: [Yes/No]
PROMPT FOR BATCH 6: Product Discovery & Marketing
(Use with: Product pages, LoyaltyPage, NotificationsPage, NotificationCenter, CookieConsent)
Markdown
Code
Preview
Verify frontend audit logging implementation for MARKETING & PRODUCT DISCOVERY against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 15 events across Phase 9 (Marketing), Phase 10 (Business):

### Phase 9 - Marketing (11 events):
MARKETING_EMAIL_SENT, MARKETING_EMAIL_DELIVERED, MARKETING_EMAIL_OPENED, MARKETING_EMAIL_CLICKED, MARKETING_EMAIL_BOUNCED, MARKETING_EMAIL_COMPLAINED, MARKETING_EMAIL_UNSUBSCRIBED, SMS_DELIVERED, SMS_FAILED, PUSH_NOTIFICATION_SENT, PUSH_NOTIFICATION_DELIVERED

### Phase 10 - Business (4 events):
LOYALTY_TIER_CHANGED, REFERRAL_CODE_GENERATED, REFERRAL_COMPLETED, PRODUCT_VIEWED

## VERIFICATION TASK

Check the frontend files and verify:

1. **EMAIL MARKETING**:
   - MARKETING_EMAIL_OPENED: Pixel tracking or API call?
   - MARKETING_EMAIL_CLICKED: click_count incremented?
   - MARKETING_EMAIL_UNSUBSCRIBED: reason captured?

2. **SMS/PUSH**:
   - SMS_DELIVERED/FAILED: carrier, error_code?
   - PUSH_NOTIFICATION_SENT/DELIVERED: device_token_hash?

3. **LOYALTY**:
   - LOYALTY_TIER_CHANGED: old_tier/new_tier, benefits_unlocked?
   - REFERRAL_CODE_GENERATED: Code captured?
   - REFERRAL_COMPLETED: reward_issued tracked?

4. **PRODUCT VIEW** (Analytics):
   - PRODUCT_VIEWED: source (search/recommendation/direct)?
   - Is session_id tracked for view correlation?
   - Is sampling implemented for high volume (10%)?

5. **COOKIE CONSENT**:
   - CONSENT_GIVEN: All consent types (marketing/analytics/cookies/location)?
   - Version and timestamp captured?

## OUTPUT FORMAT

| Channel | Events | Tracking Method | Completeness |
|---------|--------|-----------------|--------------|
| Email | 7 | Pixel/API | ?% |
| SMS | 2 | Webhook | ?% |
| Push | 2 | SDK | ?% |
| Loyalty | 3 | API | ?% |

**Marketing Attribution Gaps**: [List]
PROMPT FOR BATCH 7: Error Pages & System Health
(Use with: All error pages, ErrorBoundary)
Markdown
Code
Preview
Verify frontend audit logging implementation for ERROR HANDLING & SYSTEM HEALTH against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 11 events across Phase 6 (System Health):

DATABASE_BACKUP_STARTED, DATABASE_BACKUP_COMPLETED, DATABASE_BACKUP_FAILED, DATABASE_RESTORE_REQUESTED, DATABASE_RESTORE_COMPLETED, SCHEDULED_JOB_STARTED, SCHEDULED_JOB_COMPLETED, SCHEDULED_JOB_FAILED, SCHEDULED_JOB_TIMEOUT, CACHE_INVALIDATION, CACHE_WARMUP_COMPLETED, SEARCH_INDEX_UPDATED

## VERIFICATION TASK

Check the frontend files and verify:

1. **ERROR LOGGING**:
   - Are client-side errors logged to audit system?
   - Do error pages trigger audit events?
   - Is error severity mapped (500 → critical, 404 → low)?

2. **SYSTEM EVENTS** (Frontend-relevant):
   - CACHE_INVALIDATION: Triggered on data updates?
   - SEARCH_INDEX_UPDATED: After product changes?

3. **USER EXPERIENCE**:
   - RATE_LIMIT_EXCEEDED: VELOCITY_CHECK_TRIGGERED called?
   - SESSION_TIMEOUT: LOGOUT with reason?
   - OFFLINE_MODE: Detected and logged?

4. **ERROR BOUNDARY**:
   - Does ErrorBoundary.js log crashes to audit?

## OUTPUT FORMAT

| Error Type | HTTP Code | Audit Event Triggered | Severity |
|-----------|-----------|----------------------|----------|
| Not Found | 404 | RESOURCE_ACCESS_DENIED? | low |
| Server Error | 500 | THIRD_PARTY_INTEGRATION_ERROR? | critical |
| Rate Limit | 429 | VELOCITY_CHECK_TRIGGERED? | high |

**Error Monitoring Gaps**: [List]
PROMPT FOR BATCH 8: API & Services
(Use with: All service files - api.js, auditService.js, authService.js, etc.)
Markdown
Code
Preview
Verify frontend audit logging implementation for API LAYER & SERVICE INTEGRATION against backend specification.

## BACKEND REFERENCE (Verified Complete)
Backend implements 7 events across Phase 5 (API & Integrations):

WEBHOOK_SUBSCRIPTION_CREATED, WEBHOOK_DELIVERED, WEBHOOK_FAILED, WEBHOOK_RETRY_SCHEDULED, WEBHOOK_DISABLED, THIRD_PARTY_INTEGRATION_ERROR, THIRD_PARTY_INTEGRATION_RECOVERY

## VERIFICATION TASK

Check the frontend files and verify:

1. **API SERVICE LAYER**:
   - Does api.js attach X-Correlation-ID to all requests?
   - Are API errors logged with THIRD_PARTY_INTEGRATION_ERROR?
   - Is retry logic tracked (WEBHOOK_RETRY_SCHEDULED equivalent)?

2. **AUDIT SERVICE**:
   - Does auditService.js implement all 158 event methods?
   - Or does it use generic logEvent() with event_type parameter?
   - Is batching implemented for high-volume events?

3. **WEBHOOK HANDLING**:
   - Are webhook deliveries tracked?
   - Are failures logged with retry scheduling?

4. **RESILIENCE**:
   - Is THIRD_PARTY_INTEGRATION_RECOVERY detected?
   - Downtime duration tracked?

5. **HEADERS & CORRELATION**:
   - X-Correlation-ID generation?
   - X-Request-ID forwarding?
   - Bearer token hash for session tracking?

## OUTPUT FORMAT

| Service | Correlation ID | Error Logging | Retry Tracking | Notes |
|---------|--------------|---------------|----------------|-------|
| api.js | ✅/❌ | ✅/❌ | ✅/❌ | ... |
| auditService.js | N/A | N/A | N/A | ... |

**API Layer Completeness**: [Score]
**Critical Missing**: [List]












## VS Code Find & Replace Generator - Audit Log Alignment
Markdown
Code
Preview
You are an expert code migration assistant. Your task is to analyze frontend React/JavaScript files against a verified backend audit log specification and generate precise VS Code find and replace commands to fix implementation gaps.

## INPUT STRUCTURE (What User Will Provide)

The user will paste content in this exact order:

--- BACKEND SPECIFICATION REPORT ---
[The complete backend audit report showing all 158 implemented events with their required fields, severity levels, and implementation locations]

--- FRONTEND BATCH FILES ---
[Source code of 4-10 frontend files for one batch]

--- PREVIOUS BATCH ANALYSIS PROMPT ---
[The specific prompt used to analyze this batch]

--- GAP ANALYSIS RESULT ---
[The analysis result showing which events are missing/partial in the frontend]

---

## YOUR TASK

1. Parse the backend specification to extract required events and fields for this batch
2. Review the frontend files to locate exact insertion points and existing patterns
3. Compare against the gap analysis result
4. Generate VS Code-compatible find and replace commands

## BACKEND REFERENCE (Keep This As Source of Truth)

Based on the backend report, these are the IMMUTABLE specifications:

### Phase 1: Auth & Security (14 events) - TIER_1_IMMUTABLE
All auth events require: actor_id, actor_type, session_id, timestamp, ip_address, device_info, location
- LOGIN_SUCCESS: +mfa_used
- LOGIN_FAILED: +identifier_attempted, failure_reason, failure_count
- LOGOUT: +session_duration, logout_reason
- SESSION_REVOKED: +target_user_id, reason, revoked_by_session
- PASSWORD_CHANGED: +changed_by (self/admin), method
- PASSWORD_RESET_REQUESTED: +delivery_method, token_hash
- PASSWORD_RESET_COMPLETED: +reset_method, ip_address
- PASSWORD_RESET_FAILED: +failure_reason, ip_address
- TWO_FACTOR_ENABLED/DISABLED: +method_type, reason (for disable)
- TWO_FACTOR_CHALLENGE: +method_type, success, ip_address
- ACCOUNT_LOCKED/UNLOCKED: +reason, triggered_by, lock_duration
- SUSPICIOUS_ACTIVITY_DETECTED: +activity_type, risk_score, device_fingerprint, action_taken, correlation_events

### Phase 2: Order Lifecycle (23 events) + Financial (12 events) - TIER_1_IMMUTABLE
Cart events require: actor_id, actor_type, cart_id, timestamp
- CART_CREATED: +source (direct/wishlist/abandoned_recovery)
- CART_ITEM_ADDED/REMOVED: +product_id, sku, quantity, unit_price
- CART_ABANDONED: +cart_value, items_count, abandonment_duration, recovery_email_sent, recovery_token
- CHECKOUT_STEP_STARTED/COMPLETED/ABANDONED: +step_number, step_name, time_spent_seconds, exit_point (for abandoned)
- INVENTORY_RESERVED: +product_id, sku, quantity_reserved, reservation_expiry, reservation_token
- INVENTORY_RESERVATION_EXPIRED/RELEASED: +reason
- ORDER_PLACED: +order_number, items (JSON), total_amount, payment_method, shipping_address_id
- ORDER_FAILED: +failure_reason, error_code, cart_snapshot
- ORDER_PAYMENT_PENDING/PROCESSING: +payment_intent_id, amount
- ORDER_STATUS_CHANGED: +old_status, new_status, changed_by, automatic
- ORDER_SHIPPED/DELIVERED/CANCELLED: +tracking info, reason, refund_initiated
- ORDER_RETURN_*: +return_id, items, condition_assessment

Financial events (PCI DSS):
- PAYMENT_METHOD_ADDED/REMOVED: +method_type, last_four_digits, expiry, billing_address_id
- PAYMENT_INTENT_CREATED/SUCCESSFUL/FAILED: +payment_intent_id, amount, transaction_id
- PAYMENT_RETRIED: +attempt_number
- PAYMENT_DISPUTE_*: +dispute_id, reason, amount_disputed
- CHARGEBACK_*: +chargeback_id, bank_reason_code
- REFUND_*: +refund_id, amount, reason
- POINTS_EARNED/REDEEMED/EXPIRED/ADJUSTED: +points_amount, source, expiry_date

### Phase 3: Admin & System Control (15 events) - TIER_2_OPERATIONAL
- USER_ROLE_CHANGED: +old_role, new_role, reason
- PERMISSIONS_UPDATED: +permissions_added/removed (JSON)
- ADMIN_IMPERSONATION_STARTED/ENDED: +target_user_id, impersonation_token, duration_seconds, actions_taken_summary
- PRODUCT_CREATED/UPDATED/DELETED: +sku, changes (JSON diff), archive_location
- PRODUCT_PRICE_MODIFIED: +old_price, new_price, effective_date
- BULK_PRODUCT_PRICE_UPDATED: +rule_id, affected_count, affected_skus_sample
- INVENTORY_*: +adjustment, reason, location_id
- INVENTORY_TRANSFER_*: +from_location, to_location, quantity, discrepancy
- ORDER_STATUS_MANUALLY_CHANGED: +customer_notified

### Phase 4: User Data & Compliance (20 events) - TIER_1_IMMUTABLE (GDPR)
- ACCOUNT_CREATED: +registration_method, referral_code_used
- EMAIL_VERIFICATION_SENT/VERIFIED: +token_hash, delivery_method
- PROFILE_UPDATED: +changed_fields (array), old_values/new_values (JSON)
- EMAIL_CHANGED: +old_email, new_email, verification_status
- PHONE_CHANGED: +old_phone_hash, new_phone_hash
- ADDRESS_ADDED/UPDATED/DELETED: +address_id, address_type (shipping/billing), changes
- ACCOUNT_DEACTIVATED/REACTIVATED/DELETED: +reason, deletion_type (GDPR/standard), data_retention_expiry
- DATA_ANONYMIZED: +anonymized_user_id, retention_reason, orders_retained
- DATA_EXPORT_REQUESTED/GENERATED/DOWNLOADED/EXPIRED: +request_id, formats, deadline, checksum
- CONSENT_GIVEN/WITHDRAWN: +consent_type, version, cmp_id, withdrawal_method
- CONSENT_PREFERENCES_EXPORTED: +export_format
- PRIVACY_REQUEST_RECEIVED/ACKNOWLEDGED/FULFILLED/REJECTED: +request_type, jurisdiction, deadline
- DATA_TRANSFERRED_CROSS_BORDER: +from_region, to_region, transfer_mechanism (SCCs/BCRs/adequacy)
- AUTOMATED_DECISION_MADE/CONTESTED/REVIEWED: +decision_type, algorithm_version, input_features, outcome, confidence_score, human_review_available, explanation_provided, overturn_reason

### Phase 5: API & Integrations (12 events) - TIER_2_OPERATIONAL
- API_KEY_CREATED/ROTATED/REVOKED: +key_id, key_hash (truncated), permissions_scope, environment
- API_REQUEST_RECEIVED: +endpoint, method, request_size, correlation_id
- API_RATE_LIMIT_TRIGGERED: +limit_type, threshold, actual_rate, action_taken
- WEBHOOK_SUBSCRIPTION_CREATED: +subscription_id, endpoint_url, event_types, secret_hash
- WEBHOOK_DELIVERED/FAILED/RETRY_SCHEDULED/DISABLED: +response_time_ms, delivery_attempt, will_retry
- THIRD_PARTY_INTEGRATION_ERROR/RECOVERY: +service_name, error_code, impact_level, downtime_duration

### Phase 6: System Health (11 events) - TIER_3_ANALYTICS
- DATABASE_BACKUP_STARTED/COMPLETED/FAILED: +backup_id, storage_target, size_gb, checksum
- DATABASE_RESTORE_REQUESTED/COMPLETED: +restore_id, target_environment, approval_required
- SCHEDULED_JOB_STARTED/COMPLETED/FAILED/TIMEOUT: +job_name, execution_time_ms, records_processed, error_message
- CACHE_INVALIDATION/WARMUP_COMPLETED: +cache_key_pattern, affected_entries_count
- SEARCH_INDEX_UPDATED: +index_name, documents_updated

### Phase 7: Security Monitoring (11 events) - TIER_1_IMMUTABLE
- RESOURCE_ACCESSED/DENIED: +resource_type, resource_id, access_type, data_fields_accessed, denial_reason
- PRIVILEGED_QUERY_EXECUTED/BLOCKED: +query_hash, query_type, target_tables, rows_affected, justification, approval_ticket_id
- VELOCITY_CHECK_TRIGGERED: +check_type, threshold, actual_value, time_window, action_taken
- DEVICE_FINGERPRINT_CREATED/MISMATCH/TRUSTED: +fingerprint_hash, device_characteristics, confidence_score, similarity_score, expiry_date
- SUSPICIOUS_IP_DETECTED: +threat_type (tor/vpn/proxy/botnet), risk_score
- GEOLOCATION_ANOMALY: +expected_location, actual_location, distance_km, impossible_travel
- DATA_EXFILTRATION_ATTEMPT: +data_type, records_attempted, destination_ip, blocked, method

### Phase 8: Notifications (14 events) - TIER_3_ANALYTICS
- NOTIFICATION_CREATED/SENT/DELIVERED: +notification_id, channel, template_id, provider_message_id
- NOTIFICATION_OPENED/CLICKED/DELETED: +device_type, clicked_url, deletion_method
- NOTIFICATION_BULK_DELETED/ARCHIVED/UNARCHIVED: +count, filter_criteria
- NOTIFICATION_SETTINGS_CHANGED: +setting_key, old_value, new_value
- CHANNEL_PREFERENCES_UPDATED: +channels (JSON)
- QUIET_HOURS_TOGGLED: +start_time, end_time, timezone
- DESKTOP_NOTIFICATIONS_TOGGLED: +permission_status (granted/denied/prompted), browser

### Phase 9: Marketing (12 events) - TIER_3_ANALYTICS
- MARKETING_EMAIL_SENT/DELIVERED/OPENED/CLICKED/BOUNCED/COMPLAINED/UNSUBSCRIBED: +campaign_id, message_id, open_count, click_count, bounce_type, unsubscribe_method, reason
- SMS_DELIVERED/FAILED: +phone_hash, carrier, message_id, error_code
- PUSH_NOTIFICATION_SENT/DELIVERED: +device_token_hash, payload_size

### Phase 10: Business Operations (15 events) - TIER_3_ANALYTICS
- SERVICE_BOOKED/RESCHEDULED/COMPLETED/CANCELLED/NO_SHOW: +booking_id, service_type, mechanic_id, duration_minutes, rating_prompt_sent, no_show_party
- REVIEW_SUBMITTED/MODERATED/EDITED/DELETED/HELPFUL_MARKED: +review_id, rating, review_text_hash, media_count, moderation_action, edit_count, helpful
- LOYALTY_TIER_CHANGED: +old_tier, new_tier, qualifying_points, benefits_unlocked
- REFERRAL_CODE_GENERATED/COMPLETED: +referral_code, reward_issued
- WISHLIST_ITEM_ADDED/REMOVED: +product_id
- PRODUCT_VIEWED: +source (search/recommendation/direct), session_id

---

## CODE PATTERNS TO RECOGNIZE AND EXTEND

### Existing Audit Hook Pattern
```javascript
// Look for this pattern to extend
import { useAudit } from '../hooks/useAudit';

const Component = () => {
  const { logAuditEvent } = useAudit();
  
  const handleAction = () => {
    logAuditEvent({
      event_type: 'EXISTING_EVENT',
      event_category: 'category',
      severity: 'low|medium|high|critical',
      metadata: { ... }
    });
  };
};
Device Fingerprint Pattern
JavaScript
Copy
// Look for this pattern to add where missing
import { useDeviceFingerprint } from '../hooks/useDeviceFingerprint';

const { fingerprint, getFingerprint } = useDeviceFingerprint();

useEffect(() => {
  getFingerprint(); // Initialize on mount for auth events
}, []);
Context Provider Pattern
JavaScript
Copy
// Look for these context usages to extract data
const { currentUser } = useAuth();
const { cart, cartId, addItem, removeItem } = useCart();
const { settings, updateSettings } = useSettings();
API Service Pattern
JavaScript
Copy
// Look for axios/fetch calls to add audit logging
api.post('/endpoint', data)
  .then(response => {
    // Success audit log location
  })
  .catch(error => {
    // Failure audit log location
  });
VS CODE COMMAND GENERATION RULES
Rule 1: Exact String Matching
Use the EXACT code from the file including:
Exact variable names
Exact indentation (preserve spaces/tabs)
Exact quote style (single vs double)
Exact semicolon usage
Rule 2: Context Preservation
Include 3 lines before and after for "find" to ensure unique matching:
JavaScript
Copy
// Line before
// Line before
// ACTUAL CODE TO FIND
// Line after
// Line after
Rule 3: Import Ordering
Add imports in this order:
React imports
Third-party libraries
Context hooks (useAuth, useCart, etc.)
Audit hooks (useAudit, useDeviceFingerprint)
Services/API
Utils/Constants
Rule 4: Hook Initialization Placement
Add hook calls after existing hooks, before useEffect:
JavaScript
Copy
const Component = () => {
  const { currentUser } = useAuth(); // Existing
  const [state, setState] = useState(); // Existing
  
  // INSERT NEW HOOKS HERE
  const { logAuditEvent } = useAudit();
  const { fingerprint } = useDeviceFingerprint();
  
  useEffect(() => { ... }); // Existing effects
};
Rule 5: Event Object Structure
All events must include these base fields:
JavaScript
Copy
{
  event_type: 'EXACT_BACKEND_EVENT_NAME', // Must match backend exactly
  event_category: 'security|order|financial|user|admin|api|system|notification|marketing|business',
  actor_type: 'user|admin|super_admin|seller|system|api_key',
  user_id: currentUser?.id,
  severity: 'low|medium|high|critical',
  timestamp: new Date().toISOString(), // Or let backend set
  metadata: {
    // All required fields from backend spec
    ip_address: window.clientIp, // If available
    user_agent: navigator.userAgent,
    device_fingerprint: fingerprint,
    // Event-specific fields
  }
}
OUTPUT FORMAT
Structure your response exactly as follows:
Markdown
Code
Preview
# BATCH [X] - [BATCH NAME] FIND & REPLACE COMMANDS

## Executive Summary
- **Backend Events Required**: [X]
- **Frontend Events Found**: [X]
- **Coverage**: [X]%
- **Critical Gaps (P0)**: [X]
- **High Priority Gaps (P1)**: [X]
- **Medium Priority (P2)**: [X]

---

## Gap Matrix

| Event | Required By | Found In | Status | Missing Fields | Priority |
|-------|-------------|----------|--------|---------------|----------|
| EVENT_NAME | Backend Spec | File.js:45 | ✅ Complete | None | - |
| EVENT_NAME | Backend Spec | Not found | ❌ Missing | All | P0 |
| EVENT_NAME | Backend Spec | File.js:45 | ⚠️ Partial | field1, field2 | P1 |

---

## VS Code Commands by File

### File: [relative/path/from/project/root]

#### Command 1: [Brief description]
```json
{
  "find": "EXACT\nMULTILINE\nCODE\nTO\nFIND",
  "replace": "EXACT\nMULTILINE\nREPLACEMENT\nCODE",
  "isRegex": false,
  "matchCase": true,
  "preserveIndent": true
}
Command 2: [Description for regex if needed]
JSON
Copy
{
  "find": "regex_pattern_with_(groups)",
  "replace": "replacement_with_$1_$2",
  "isRegex": true,
  "regexFlags": "gm",
  "preserveIndent": true
}
New File Creations (if any)
If a file needs to be created (e.g., missing hook):
File: [path]
JavaScript
Copy
// Complete file content
import React from 'react';

export const useNewHook = () => {
  // Implementation
};
Insertion-Only Commands (no replacement)
For adding new functions/events where no existing code matches:
Location: [File] after [existingFunctionName]
JSON
Copy
{
  "operation": "insertAfter",
  "file": "frontend/src/path/file.js",
  "after": "existingFunctionName",
  "code": "  const newFunction = () => {\n    // Code with proper indentation\n  };"
}
Multi-File Operations
Add Import to Multiple Files
JSON
Copy
{
  "operation": "addImportToAll",
  "files": [
    "frontend/src/pages/admin/AdminUsersPage.js",
    "frontend/src/pages/superadmin/SuperAdminUsersPage.js"
  ],
  "import": "import { useAudit } from '../../hooks/useAudit';",
  "after": "import React from 'react';"
}
Verification Checklist
After applying commands, verify:
[ ] All P0 events implemented with correct fields
[ ] Severity levels match backend specification
[ ] Event names match backend exactly (case-sensitive)
[ ] All imports resolve without errors
[ ] No duplicate hook initializations
[ ] Device fingerprint captured for auth/security events
[ ] GDPR events include jurisdiction field where required
Priority Definitions
P0 (Critical): TIER_1_IMMUTABLE events (auth, financial, GDPR) - Legal/compliance risk
P1 (High): Core business logic events (orders, products) - Operational impact
P2 (Medium): Analytics/operational events - Metrics impact
P3 (Low): Nice-to-have optimizations
Generate complete, tested, production-ready VS Code find and replace commands.
plain
Copy

---

## **WHAT TO ATTACH WHEN USING THIS PROMPT**

Attach content in this exact order:

```markdown
--- BACKEND SPECIFICATION REPORT ---
[Paste the complete backend report with all 158 events]

--- FRONTEND BATCH FILES ---
[Paste source code of batch files - e.g., 5-10 files]

--- BATCH ANALYSIS PROMPT USED ---
[Paste the specific prompt from earlier - e.g., "Verify frontend audit logging implementation for USER ACCOUNT & PROFILE..."]

--- GAP ANALYSIS RESULT ---
[Paste the analysis result showing missing/partial events]