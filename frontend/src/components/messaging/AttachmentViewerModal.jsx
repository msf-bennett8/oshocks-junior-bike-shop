import React, { useEffect, useRef } from 'react';
import { X, Download, ExternalLink, FileText, Image, File, Music, Video } from 'lucide-react';

const AttachmentViewerModal = ({ attachment, message, onClose, onReply }) => {
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  const getFileIcon = () => {
    if (!attachment) return <File className="w-16 h-16 text-gray-400" />;
    const type = attachment.mime_type || attachment.file_type || '';
    if (type.startsWith('image/')) return <Image className="w-16 h-16 text-blue-400" />;
    if (type.startsWith('video/')) return <Video className="w-16 h-16 text-red-400" />;
    if (type.startsWith('audio/')) return <Music className="w-16 h-16 text-green-400" />;
    if (type.includes('pdf')) return <FileText className="w-16 h-16 text-red-400" />;
    return <File className="w-16 h-16 text-gray-400" />;
  };

  const isImage = attachment?.mime_type?.startsWith('image/') || attachment?.file_type === 'image';
  const isVideo = attachment?.mime_type?.startsWith('video/');
  const fileName = attachment?.original_name || attachment?.file_name || 'Attachment';
  const fileSize = attachment?.file_size ? formatFileSize(attachment.file_size) : '';
  const senderName = message?.sender?.name || message?.sender_name || 'Unknown';
  const messageBody = message?.body || '';

  function formatFileSize(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon()}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{fileName}</h3>
              <p className="text-xs text-gray-500">{fileSize} • {attachment?.mime_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={attachment?.cloudinary_secure_url || attachment?.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <a
              href={attachment?.cloudinary_secure_url || attachment?.file_path}
              download={fileName}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* File Preview */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            {isImage ? (
              <img
                src={attachment?.cloudinary_secure_url || attachment?.file_path}
                alt={fileName}
                className="w-full max-h-[50vh] object-contain"
              />
            ) : isVideo ? (
              <video
                src={attachment?.cloudinary_secure_url || attachment?.file_path}
                controls
                className="w-full max-h-[50vh]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                {getFileIcon()}
                <p className="mt-4 text-gray-600 font-medium">{fileName}</p>
                <p className="text-sm text-gray-400 mt-1">Preview not available for this file type</p>
                <a
                  href={attachment?.cloudinary_secure_url || attachment?.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open File
                </a>
              </div>
            )}
          </div>

          {/* Message Context */}
          {message && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {senderName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">{senderName}</span>
                    <span className="text-xs text-gray-400">
                      {message?.created_at ? new Date(message.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{messageBody}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
          {onReply && (
            <button
              onClick={() => {
                onReply();
                onClose();
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentViewerModal;
