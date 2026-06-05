import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, Info, Loader2,
  X, RefreshCw, Trash2, RotateCcw, Eye, ArrowRight
} from 'lucide-react';

/**
 * ModerationActionModal - Reusable modal for admin/super_admin moderation actions
 *
 * type options:
 * - 'confirm'    → Yes/No confirmation (approve, reject, delete)
 * - 'alert'      → OK dismiss (success, error, info)
 * - 'loading'    → Spinner with message
 * - 'preview'    → Content preview with actions
 */

const TYPE_CONFIG = {
  confirm: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    confirmColor: 'bg-yellow-500 hover:bg-yellow-600',
    confirmText: 'Confirm',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confirmColor: 'bg-green-500 hover:bg-green-600',
    confirmText: 'OK',
  },
  error: {
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmColor: 'bg-red-500 hover:bg-red-600',
    confirmText: 'Dismiss',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmColor: 'bg-blue-500 hover:bg-blue-600',
    confirmText: 'OK',
  },
  loading: {
    icon: Loader2,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    confirmColor: 'bg-indigo-500 hover:bg-indigo-600',
    confirmText: 'Please wait...',
  },
};

const ModerationActionModal = ({
  isOpen,
  onClose,
  type = 'confirm',
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  isLoading = false,
  children, // For preview content
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.confirm;
  const Icon = config.icon;
  const confirmBtnText = confirmText || config.confirmText;

  const handleConfirm = () => {
    if (!isLoading && onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading && onCancel) onCancel();
    if (!isLoading && onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Content (for conversion preview etc) */}
          {children && (
            <div className="px-6 py-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                {children}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 pt-4 flex gap-3">
            {showCancel && (
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${config.confirmColor}`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationActionModal;
