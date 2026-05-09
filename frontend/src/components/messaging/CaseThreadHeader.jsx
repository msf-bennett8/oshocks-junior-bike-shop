import React from 'react';
import { CaseStatusChip } from './CaseStatusChip';
import { ClipboardCopy, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const typeIcons = {
  order_issue: Package,
  account_help: AlertTriangle,
  report_problem: AlertTriangle,
  delivery_question: Package,
};

const typeLabels = {
  order_issue: 'Order Issue',
  account_help: 'Account Help',
  report_problem: 'Report Problem',
  delivery_question: 'Delivery',
};

export const CaseThreadHeader = ({ supportCase, isActive, onClick }) => {
  const Icon = typeIcons[supportCase.case_type] || AlertTriangle;
  const label = typeLabels[supportCase.case_type] || 'Support';

  return (
    <div
      onClick={onClick}
      className={`mx-4 my-2 p-3 rounded-xl border cursor-pointer transition-all ${
        isActive
          ? 'bg-orange-50 border-orange-300 shadow-sm'
          : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">{label}</span>
              <CaseStatusChip status={supportCase.status} size="sm" />
            </div>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{supportCase.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {supportCase.case_id}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(supportCase.case_id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy case ID"
          >
            <ClipboardCopy className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {supportCase.order && (
        <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            <span className="font-mono">{supportCase.order.order_number || supportCase.order.order_display}</span>
          </div>
          {supportCase.order.purchase_id && (
            <div className="flex items-center gap-1.5 pl-4">
              <span className="text-gray-300">ID:</span>
              <span className="font-mono text-gray-500">{supportCase.order.purchase_id}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseThreadHeader;
