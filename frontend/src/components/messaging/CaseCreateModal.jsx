import React, { useState } from 'react';
import { X, Package, User, AlertTriangle, Truck, Send } from 'lucide-react';
import api from '../../services/api';

const caseTypes = [
  { value: 'order_issue', label: 'Order Issue', icon: Package, color: 'bg-orange-100 text-orange-700' },
  { value: 'account_help', label: 'Account Help', icon: User, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'report_problem', label: 'Report Problem', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  { value: 'delivery_question', label: 'Delivery', icon: Truck, color: 'bg-cyan-100 text-cyan-700' },
];

export const CaseCreateModal = ({ conversationId, onClose, onCreated }) => {
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // (debug removed)

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[CaseCreateModal] handleSubmit called');
    if (!type || !subject.trim()) {
      console.log('[CaseCreateModal] Validation failed - type or subject missing');
      alert('Please select a case type and enter a subject.');
      return;
    }

    setLoading(true);
    console.log('[CaseCreateModal] Loading state set to true');

    try {
      // Ensure guest session is initialized for anonymous users
      console.log('[CaseCreateModal] Loading guest session utils...');
      
      // Inline guest session utils to avoid dynamic import issues in production
      const getGuestSessionId = () => {
        let sessionId = localStorage.getItem('oshocks_guest_session_id');
        if (!sessionId) {
          sessionId = 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('oshocks_guest_session_id', sessionId);
        }
        return sessionId;
      };
      
      const getGuestProfile = () => ({
        name: localStorage.getItem('oshocks_guest_name'),
        email: localStorage.getItem('oshocks_guest_email'),
      });
      
      const setGuestProfile = (name, email) => {
        if (name) localStorage.setItem('oshocks_guest_name', name);
        if (email) localStorage.setItem('oshocks_guest_email', email);
      };
      
      const generateAnonName = () => {
        const digits = Math.floor(1000 + Math.random() * 9000);
        return 'anon' + digits;
      };
      
      console.log('[CaseCreateModal] Guest session utils loaded');

      const guestId = getGuestSessionId();
      console.log('[CaseCreateModal] Guest session ID:', guestId);

      const profile = getGuestProfile();
      console.log('[CaseCreateModal] Guest profile:', profile);

      if (!profile.name) {
        const anonName = generateAnonName();
        setGuestProfile(anonName, profile.email);
        console.log('[CaseCreateModal] Generated guest name:', anonName);
      }
      const payload = {
        case_type: type,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      };

      const trimmedOrder = orderNumber.trim();
      if (trimmedOrder) {
        payload.purchase_id = trimmedOrder;
      }

      console.log('[CaseCreateModal] Sending POST to /conversations/' + conversationId + '/cases with payload:', payload);
      console.log('[CaseCreateModal] API baseURL:', api.defaults.baseURL);

      const response = await api.post(`/conversations/${conversationId}/cases`, payload);
      console.log('[CaseCreateModal] API response:', response);
      console.log('[CaseCreateModal] Response data:', response.data);

      onCreated?.(response.data.data);
      onClose();
    } catch (err) {
      console.error('[CaseCreateModal] Case creation failed:', err);
      console.error('[CaseCreateModal] Error response:', err.response);
      console.error('[CaseCreateModal] Error message:', err.message);
      console.error('[CaseCreateModal] Error config:', err.config);
      alert('Case creation failed: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      console.log('[CaseCreateModal] Loading state set to false');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">New Support Case</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Case Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {caseTypes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      type === t.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${type === t.value ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium text-gray-700">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Purchase ID / Order Lookup (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase ID (optional)</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AF7SEIV1U0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-400 mt-1">Found in your order confirmation email or SMS</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!type || !subject.trim() || loading}
              className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseCreateModal;
