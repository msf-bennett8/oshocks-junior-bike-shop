import React, { useState } from 'react';
import { CaseStatusChip } from './CaseStatusChip';
import { useAuth } from '../../context/AuthContext';

export const CaseInfoBanner = ({ supportCase, onClaim, onEscalate, onResolve, onClose }) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);

  if (!supportCase) return null;

  const isAgent = user?.canHandleSupportCases || user?.role === 'admin' || user?.role === 'super_admin';
  const isAssigned = supportCase.assigned_to === user?.id;
  const canClaim = isAgent && supportCase.status === 'new' && !supportCase.assigned_to;
  const canEscalate = supportCase.status !== 'escalated' && supportCase.status !== 'closed';
  const canResolve = ['open', 'in_progress', 'pending_user', 'escalated'].includes(supportCase.status);
  const canClose = supportCase.status === 'resolved';

  const typeLabels = {
    order_issue: { label: 'Order Issue', color: 'bg-orange-100 text-orange-800' },
    account_help: { label: 'Account Help', color: 'bg-indigo-100 text-indigo-800' },
    report_problem: { label: 'Report Problem', color: 'bg-red-100 text-red-800' },
    delivery_question: { label: 'Delivery Question', color: 'bg-cyan-100 text-cyan-800' },
  };

  const typeConfig = typeLabels[supportCase.case_type] || { label: 'Support', color: 'bg-gray-100' };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Left: Case ID & Type */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Case ID:</span>
            <span className="font-mono text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
              {supportCase.case_id}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(supportCase.case_id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy case ID"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: Status & Priority */}
        <div className="flex items-center gap-2">
          <CaseStatusChip status={supportCase.status} priority={supportCase.priority} showPriority />
        </div>

        {/* Right: Agent & Actions */}
        <div className="flex items-center gap-3">
          {supportCase.assigned_agent && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                {supportCase.assigned_agent.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-gray-600">{supportCase.assigned_agent.name}</span>
            </div>
          )}

          {isAgent && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
              >
                Actions
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  {canClaim && (
                    <button
                      onClick={() => { onClaim?.(); setShowActions(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 first:rounded-t-lg"
                    >
                      🎯 Claim Case
                    </button>
                  )}
                  {canResolve && isAssigned && (
                    <button
                      onClick={() => { onResolve?.(); setShowActions(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      ✅ Mark Resolved
                    </button>
                  )}
                  {canEscalate && (
                    <button
                      onClick={() => { onEscalate?.(); setShowActions(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      🚨 Escalate
                    </button>
                  )}
                  {canClose && (
                    <button
                      onClick={() => { onClose?.(); setShowActions(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                    >
                      🔒 Close Case
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Link (if order_issue) */}
      {supportCase.order && (
        <div className="mt-2 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Order:</span>
            <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded inline-flex items-center gap-1">
              {supportCase.order.order_display || supportCase.order.order_number || supportCase.order.purchase_id}
            <button
              onClick={() => navigator.clipboard.writeText(supportCase.order.order_display || supportCase.order.order_number || supportCase.order.purchase_id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
              title="Copy order ID"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{supportCase.order.status}</span>
          </div>
          {supportCase.order.purchase_id && (
            <div className="flex items-center gap-2 pl-[42px]">
              <span className="text-gray-400">Purchase ID:</span>
              <span className="font-mono text-gray-600">{supportCase.order.purchase_id}</span>
              <button
                onClick={() => navigator.clipboard.writeText(supportCase.order.purchase_id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
                title="Copy purchase ID"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseInfoBanner;
