import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import paymentService from '../../services/paymentService';
import { useCart } from '../../context/CartContext';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart(); // Add this to clear cart
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      const urlStatus = searchParams.get('status');
      const orderId = localStorage.getItem('pendingOrderId');
      const orderNumber = localStorage.getItem('pendingOrderNumber');

      console.log('========================================');
      console.log('🔄 [PaymentCallback] Page loaded');
      console.log('📍 Reference:', reference);
      console.log('📍 TrxRef:', trxref);
      console.log('📍 URL Status:', urlStatus);
      console.log('📍 Order ID from storage:', orderId);
      console.log('========================================');

      // If URL has failed status, show failed immediately
      if (urlStatus === 'failed') {
        setStatus('failed');
        setMessage('Payment was cancelled or failed');
        return;
      }

      if (!reference) {
        console.error('❌ No reference found in URL');
        setStatus('failed');
        setMessage('Invalid payment reference');
        return;
      }

      try {
        // Wait for webhook to process
        console.log('⏳ Waiting for webhook processing...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Use verifyPayment method for card payments
        console.log('🔍 Verifying payment with reference:', reference);
        const response = await paymentService.verifyPayment(reference);
        
        console.log('✅ Verification response:', response);

        if (response.data?.status === 'success' || response.data?.status === 'completed') {
          console.log('🎉 Payment verified successfully!');
          setStatus('success');
          
          // Clear cart and pending order data
          console.log('🗑️ Clearing cart and localStorage...');
          clearCart();
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('pendingOrderNumber');
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate('/order-success', {
              state: { 
                orderNumber: orderNumber || response.data?.reference,
                paymentMethod: 'card',
                reference: reference
              }
            });
          }, 2000);
        } else {
          console.error('❌ Payment not successful:', response.data);
          setStatus('failed');
          setMessage(response.data?.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('❌ Error during verification:', error);
        setStatus('failed');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [searchParams, navigate, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600">
              Redirecting to your order confirmation...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {message || "We couldn't verify your payment. If you were charged, please contact support."}
            </p>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Return to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;