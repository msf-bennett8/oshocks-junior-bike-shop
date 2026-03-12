# M-Pesa Daraja 2.0 Integration Guide

## Overview
This document describes the M-Pesa Daraja API integration for Oshocks Bike Shop platform.

## Architecture
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Customer  │────▶│  Your Server │────▶│   Safaricom │
│  (Frontend) │◀────│   (Laravel)  │◀────│   (M-Pesa)  │
└─────────────┘     └──────────────┘     └─────────────┘
│
▼
┌──────────────┐
│   Callback   │
│    Handler   │
└──────────────┘
plain
Copy

## Payment Flow

### 1. STK Push (Customer Payment)

1. Customer enters phone number on checkout
2. Frontend calls `POST /api/v1/payments/mpesa/initiate`
3. Backend creates payment record (status: pending)
4. Backend calls Safaricom STK Push API
5. Customer receives push notification on phone
6. Customer enters M-Pesa PIN
7. Safaricom sends callback to your server
8. Backend updates payment status (completed/failed)
9. Order status updated automatically

### 2. B2C Payout (Paying Sellers)

1. Admin initiates payout from dashboard
2. Backend calls Safaricom B2C API
3. Seller receives money on M-Pesa
4. Safaricom sends callback confirmation
5. Backend updates payout records

## API Endpoints

### Customer Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/mpesa/initiate` | Initiate STK Push |
| GET | `/api/v1/payments/{id}` | Check payment status |
| POST | `/api/v1/payments/mpesa/callback` | M-Pesa callback (public) |

### Manual Recording

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/record` | Record cash/bank payment |

## Environment Setup

### 1. Sandbox Testing

Use these test credentials:
- **Shortcode:** 174379
- **Passkey:** bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
- **Test Phone:** 254708374149
- **Test PIN:** Any 4 digits

### 2. Production

1. Apply for Paybill/Till at Safaricom
2. Update credentials in `.env`
3. Set `MPESA_ENV=production`
4. Ensure callback URLs are HTTPS

## Configuration

Add to `backend/.env`:

```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback
Testing
Simulate STK Success
Use Daraja API simulator to send success callback.
Test Phone Numbers (Sandbox)
254708374149 - Success
254708374150 - Insufficient funds
254708374151 - Wrong PIN
Security Notes
Never commit .env with real credentials
Callback URLs must verify origin (Safaricom IPs)
Use HTTPS for all callbacks
Implement idempotency for callbacks
Log all transactions for audit
Troubleshooting
Table
Issue	Solution
Invalid credentials	Check Consumer Key/Secret
Callback not received	Verify URL is HTTPS and public
Wrong PIN	Customer entered incorrect PIN
Insufficient funds	Customer has insufficient balance
Timeout	Network issue, retry transaction
Support
Safaricom Developer Portal: https://developer.safaricom.co.ke
Daraja Documentation: https://developer.safaricom.co.ke/docs
