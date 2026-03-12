import React, { useState, useEffect } from 'react';
import cardPaymentService from '../../services/cardPaymentService';

const PaystackPayment = ({ order, email, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Paystack script
    cardPaymentService.loadPaystackScript()
      .then(() => setScriptLoaded(true))
      .catch(err => {
        console.error('Failed to load Paystack:', err);
        onError?.('Payment system unavailable');
      });
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError?.('Payment system not ready');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Initialize payment on backend
      const initResponse = await cardPaymentService.initializePayment({
        order_id: order.id,
        email: email
      });

      if (!initResponse.success) {
        throw new Error(initResponse.message);
      }

      const { authorization_url, reference } = initResponse.data;

      // Step 2: Option A - Redirect to Paystack
      // window.location.href = authorization_url;

      // Step 2: Option B - Use inline popup (better UX)
      const paystackConfig = {
        publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: order.total_amount,
        reference: reference,
        metadata: {
          order_id: order.id,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.order_number
            }
          ]
        }
      };

      const response = await cardPaymentService.openPaystackPopup(paystackConfig);
      
      // Step 3: Verify payment
      const verifyResponse = await cardPaymentService.verifyPayment(response.reference);
      
      if (verifyResponse.data?.status === 'success') {
        onSuccess?.(response.reference);
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paystack-payment">
      <button
        onClick={handlePayment}
        disabled={loading || !scriptLoaded}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pay with Card
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secured by Paystack
      </div>

      {/* Test Cards Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="font-semibold text-yellow-800">Test Cards:</p>
          <p>Success: 4084084084084081 | CVV: 408 | Exp: 12/25</p>
          <p>Failure: 4084080000005409 | CVV: 001 | Exp: 12/25</p>
        </div>
      )}
    </div>
  );
};

export default PaystackPayment;
