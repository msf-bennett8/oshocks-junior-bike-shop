import React from 'react';

const SeatAvailability = ({ current, max, size = 'md' }) => {
  const remaining = max - current;
  const percentage = (current / max) * 100;
  
  let urgencyColor = 'text-green-600 bg-green-50';
  let urgencyText = `${remaining} spots left`;
  let barColor = 'bg-green-500';
  
  if (percentage >= 90) {
    urgencyColor = 'text-red-600 bg-red-50';
    urgencyText = `Only ${remaining} left!`;
    barColor = 'bg-red-500';
  } else if (percentage >= 75) {
    urgencyColor = 'text-orange-600 bg-orange-50';
    urgencyText = `${remaining} spots left`;
    barColor = 'bg-orange-500';
  } else if (percentage >= 50) {
    urgencyColor = 'text-yellow-600 bg-yellow-50';
    urgencyText = `${remaining} spots left`;
    barColor = 'bg-yellow-500';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${urgencyColor} ${sizeClasses[size]} w-fit`}>
        <span className={`w-1.5 h-1.5 rounded-full ${barColor} ${percentage >= 90 ? 'animate-pulse' : ''}`} />
        {urgencyText}
      </span>
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SeatAvailability;