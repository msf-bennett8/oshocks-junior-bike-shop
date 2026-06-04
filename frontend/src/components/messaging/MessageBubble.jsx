
// ============================================================================
// MESSAGE BUBBLE — Single message with avatar, timestamp, status, reactions, reply
// ============================================================================
import { memo } from 'react';
import { Reply, Pencil, Trash2, Check, CheckCheck, Phone, Paperclip } from 'lucide-react';
import Avatar from '../common/Avatar';

const MessageBubble = memo(({
  message,
  isOwn,
  showAvatar = true,
  isLastInGroup = true,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onViewAttachment,
  replyToMessage = null,
  isContextMessage = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (message.is_deleted) return null;
    if (message.read_at) return <CheckCheck className="w-3 h-3 text-blue-400" />;
    if (message.delivered_at) return <CheckCheck className="w-3 h-3 text-gray-400" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  const isCallInvite = message.type === 'call_invite';
  const isDeleted = message.is_deleted;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group ${isContextMessage ? 'opacity-55' : ''}`}>
      {/* Avatar for others */}
      {!isOwn && showAvatar && (
        <Avatar
          src={message.sender?.avatar}
          name={message.sender?.name || message.sender_name || 'Guest'}
          size={32}
          className="mr-2 self-end"
        />
      )}
      
      <div className={`max-w-[75%] ${!isOwn && !showAvatar ? 'ml-10' : ''}`}>
        {/* Reply preview */}
        {replyToMessage && !isDeleted && (
          <div className={`mb-1 px-3 py-1.5 rounded-t-lg text-xs ${
            isOwn ? 'bg-blue-700 text-blue-100' : 'bg-gray-200 text-gray-600'
          }`}>
        <p className="font-medium truncate">{replyToMessage.sender?.name || replyToMessage.sender_name || 'Guest'}</p>
        <p className="truncate opacity-75">{typeof replyToMessage.body === 'string' ? replyToMessage.body : String(replyToMessage.body ?? '')}</p>
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl text-sm ${
            isDeleted
              ? 'bg-gray-100 text-gray-400 italic'
              : isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
          } ${isCallInvite ? 'border-2 border-blue-300' : ''} ${replyToMessage ? (isOwn ? 'rounded-tr-lg' : 'rounded-tl-lg') : ''} ${isContextMessage ? 'border-dashed border-gray-300' : ''}`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {isContextMessage && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                #{message.case_id?.slice(-6) || 'General'}
              </span>
            </div>
          )}
          {isDeleted ? (
            <p className="text-xs">This message was deleted</p>
          ) : isCallInvite ? (
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Missed call</p>
                <p className="text-xs opacity-75">
                  {message.metadata?.call_type === 'video' ? 'Video call' : 'Voice call'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap break-words">
                {typeof message.body === 'string' ? message.body.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className={isOwn ? 'text-blue-100' : 'text-gray-900'}>{part.slice(2, -2)}</strong>;
                  }
                  return <span key={i}>{part}</span>;
                }) : typeof message.body === 'object' && message.body !== null ? (
                  <span className="text-red-400 text-xs">[Invalid message body: object]</span>
                ) : (
                  <span className="text-red-400 text-xs">[Invalid message: {String(message.body ?? '')}]</span>
                )}
              </p>
              
              {/* Attachments preview */}
              {message.attachments?.map(att => (
                <div key={att.id} className="mt-2">
                  {att.is_image || att.file_type === 'image' ? (
                    <button
                      onClick={() => onViewAttachment?.(att, message)}
                      className="block w-full text-left group relative"
                    >
                      <img 
                        src={att.cloudinary_secure_url || att.file_path} 
                        alt={att.file_name || att.original_name} 
                        className="rounded-lg max-w-full max-h-48 object-cover group-hover:opacity-90 transition-opacity" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                        <span className="bg-white/90 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                          View Attachment
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewAttachment?.(att, message)}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg ${isOwn ? 'bg-blue-700 hover:bg-blue-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors text-left`}
                    >
                      <Paperclip className={`w-4 h-4 flex-shrink-0 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{att.original_name || att.file_name}</p>
                        <p className="text-[10px] opacity-75">{att.human_readable_size || att.file_size}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isOwn ? 'bg-blue-800 text-blue-100' : 'bg-gray-200 text-gray-600'}`}>
                        View
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
          
          {/* Hover actions */}
          {!isDeleted && showActions && (
            <div className={`absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 flex items-center gap-1 px-1`}>
              <button onClick={onReply} className="p-1 hover:bg-gray-100 rounded-full bg-white shadow-sm" title="Reply">
                <Reply className="w-3.5 h-3.5 text-gray-500" />
              </button>
              {isOwn && (
                <>
                  <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded-full bg-white shadow-sm" title="Edit">
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded-full bg-white shadow-sm" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Footer: time + status + reactions */}
        <div className={`flex items-center gap-1.5 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400">
            {formatTime(message.created_at)}
            {message.is_edited && ' (edited)'}
          </span>
          {isOwn && getStatusIcon()}
          
          {/* Reactions summary */}
          {message.reactions?.length > 0 && (
            <div className="flex items-center gap-0.5 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100 -mt-2">
              {message.reactions.map(r => (
                <span key={r.reaction} className="text-xs" title={r.users?.join(', ')}>
                  {r.reaction} {r.count > 1 && <span className="text-[10px] text-gray-500">{r.count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar;
});

export default MessageBubble;
