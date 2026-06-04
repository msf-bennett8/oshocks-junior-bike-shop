
const statusConfig = {
  new: { label: 'New', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' },
  open: { label: 'Open', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  pending_user: { label: 'Pending User', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  resolved: { label: 'Resolved', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  escalated: { label: 'Escalated', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500 animate-pulse' },
};

// Appointment status config for service bookings
const appointmentStatusConfig = {
  pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500 animate-pulse' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  rescheduled: { label: 'Rescheduled', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-600' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-600' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-green-600' },
  medium: { label: 'Medium', color: 'text-blue-600' },
  high: { label: 'High', color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600 font-bold' },
};

export const CaseStatusChip = ({ status, priority, showPriority = false, size = 'sm', appointmentStatus }) => {
  // If appointmentStatus is provided (service booking), show that instead
  const config = appointmentStatus 
    ? (appointmentStatusConfig[appointmentStatus] || appointmentStatusConfig.pending)
    : (statusConfig[status] || statusConfig.new);
  
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
      {showPriority && priority && (
        <span className={`text-xs ${priorityConfig[priority]?.color || ''}`}>
          {priorityConfig[priority]?.label}
        </span>
      )}
    </div>
  );
};

export default CaseStatusChip;
