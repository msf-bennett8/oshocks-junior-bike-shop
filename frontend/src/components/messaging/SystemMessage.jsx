import React from 'react';
import { formatDistanceToNow } from 'date-fns';

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

export const SystemMessage = ({ event, timestamp, actor, details }) => {
  const icon = systemIcons[event] || systemIcons.default;
  const timeAgo = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : '';

  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2 max-w-md">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-600 text-center">
          {details || `${event.replace('_', ' ').toUpperCase()}`}
          {actor && <span className="font-medium text-gray-800"> by {actor}</span>}
        </span>
        {timeAgo && <span className="text-xs text-gray-400 ml-1">{timeAgo}</span>}
      </div>
    </div>
  );
};

export default SystemMessage;
