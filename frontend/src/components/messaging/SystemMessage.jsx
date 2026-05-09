import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardCopy, Check } from 'lucide-react';

const systemIcons = {
  created: '✨',
  assigned: '👤',
  escalated: '🚨',
  resolved: '✅',
  closed: '🔒',
  reopened: '🔓',
  transferred: '↔️',
  claimed: '🎯',
  default: '📌',
};

const CopyableText = ({ text, label, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="font-mono">{text}</span>
      <button
        onClick={handleCopy}
        className="p-0.5 hover:bg-gray-200 rounded transition-colors focus:outline-none"
        title={`Copy ${label}`}
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <ClipboardCopy className="w-3 h-3 text-gray-400" />
        )}
      </button>
    </span>
  );
};

export const SystemMessage = ({ event, timestamp, actor, details, caseId, orderDisplay }) => {
  const icon = systemIcons[event] || systemIcons.default;
  const timeAgo = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : '';
  const [copiedCase, setCopiedCase] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const handleCopyCase = async () => {
    if (!caseId) return;
    try {
      await navigator.clipboard.writeText(caseId);
      setCopiedCase(true);
      setTimeout(() => setCopiedCase(false), 2000);
    } catch (err) {
      console.error('Failed to copy case ID:', err);
    }
  };

  const handleCopyOrder = async () => {
    if (!orderDisplay) return;
    try {
      await navigator.clipboard.writeText(orderDisplay);
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    } catch (err) {
      console.error('Failed to copy order ID:', err);
    }
  };

  // Build enhanced message for case creation with order
  let messageContent = details || `${event.replace('_', ' ').toUpperCase()}`;
  
  // If this is a case creation event and we have caseId, format it nicely
  if (event === 'created' && caseId) {
    const orderPart = orderDisplay ? (
      <span className="inline-flex items-center gap-1">
        {' for order '}
        <CopyableText text={orderDisplay} label="order ID" />
      </span>
    ) : null;
    
    messageContent = (
      <span className="inline-flex items-center gap-1 flex-wrap">
        {'New Case Created: '}
        <CopyableText text={caseId} label="case ID" />
        {orderPart}
      </span>
    );
  } else if (event === 'created' && !caseId && details) {
    // Fallback: if details already contains case info but no structured data
    messageContent = details;
  }

  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2 max-w-lg">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-600 text-center flex items-center gap-1 flex-wrap">
          {messageContent}
          {actor && <span className="font-medium text-gray-800"> by {actor}</span>}
        </span>
        {timeAgo && <span className="text-xs text-gray-400 ml-1">{timeAgo}</span>}
      </div>
    </div>
  );
};

export default SystemMessage;
