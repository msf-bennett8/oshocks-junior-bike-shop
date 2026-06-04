import { CaseStatusChip } from './CaseStatusChip';

export const SupportCaseBadge = ({ supportCase, compact = false }) => {
  if (!supportCase) return null;

  const { case_id, case_type, status, priority, assigned_agent } = supportCase;

  const typeLabels = {
    order_issue: { label: 'Order', icon: '📦', color: 'bg-orange-100 text-orange-700' },
    account_help: { label: 'Account', icon: '👤', color: 'bg-indigo-100 text-indigo-700' },
    report_problem: { label: 'Report', icon: '⚠️', color: 'bg-red-100 text-red-700' },
    delivery_question: { label: 'Delivery', icon: '🚚', color: 'bg-cyan-100 text-cyan-700' },
  };

  const typeConfig = typeLabels[case_type] || { label: 'Support', icon: '💬', color: 'bg-gray-100' };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`text-xs px-1.5 py-0.5 rounded ${typeConfig.color} font-mono`}>
          {case_id}
        </span>
        <CaseStatusChip status={status} size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeConfig.icon}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <span className="font-mono text-sm font-bold text-gray-800 tracking-wide">
            {case_id}
          </span>
        </div>
        <CaseStatusChip status={status} priority={priority} showPriority />
      </div>
      {assigned_agent && (
        <div className="text-xs text-gray-500">
          Agent: <span className="font-medium text-gray-700">{assigned_agent.name}</span>
        </div>
      )}
    </div>
  );
};

export default SupportCaseBadge;
