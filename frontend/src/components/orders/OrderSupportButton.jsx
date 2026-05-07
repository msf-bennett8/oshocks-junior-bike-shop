import React, { useState } from 'react';
import { Headphones, MessageSquare, Loader2 } from 'lucide-react';
import CreateChatModal from '../messaging/CreateChatModal';

export const OrderSupportButton = ({ order, existingCase = null }) => {
  const [showModal, setShowModal] = useState(false);

  if (existingCase) {
    return (
      <button
        onClick={() => {/* Navigate to conversation */}}
        className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="font-mono text-xs">{existingCase.case_id}</span>
        <span className="text-xs opacity-70">• {existingCase.status}</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
      >
        <Headphones className="w-4 h-4" />
        Get Help with this Order
      </button>

      <CreateChatModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orderContext={{
          id: order.id,
          orderNumber: order.order_number || order.order_display,
        }}
      />
    </>
  );
};

export default OrderSupportButton;
