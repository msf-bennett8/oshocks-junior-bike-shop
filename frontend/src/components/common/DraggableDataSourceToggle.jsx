// src/components/common/DraggableDataSourceToggle.jsx
// Exact Accella Analytics style — rounded-lg container, tinted active button, gray inactive

import React, { useState, useRef, useEffect } from 'react';
import { Server, TrainFront, Shuffle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import dataSourceManager, { ENVIRONMENTS, DEFAULT_SOURCES } from '../../services/dataSourceManager';
import toast from 'react-hot-toast';

const DraggableDataSourceToggle = () => {
  const [currentKey, setCurrentKey] = useState(dataSourceManager.getCurrentKey());
  const [showNotification, setShowNotification] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('oshocks_toggle_position');
    return saved ? JSON.parse(saved) : { x: 20, y: 80 };
  });

  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  useEffect(() => {
    const unsubscribe = dataSourceManager.subscribe((changeInfo) => {
      setCurrentKey(changeInfo.newSource);
    });
    return unsubscribe;
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('button:not([data-drag-handle])')) return;
    if (isFollowing) return;
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleGreenDotClick = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300 && lastTapRef.current > 0) {
      setIsFollowing(true);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isFollowing) return;
    let newX, newY;
    if (isFollowing) {
      const rect = dragRef.current.getBoundingClientRect();
      newX = e.clientX - rect.width / 2;
      newY = e.clientY - rect.height / 2;
    } else {
      newX = e.clientX - offsetRef.current.x;
      newY = e.clientY - offsetRef.current.y;
    }
    const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 200);
    const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 50);
    setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!isFollowing) localStorage.setItem('oshocks_toggle_position', JSON.stringify(position));
  };

  useEffect(() => {
    if (isDragging || isFollowing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isFollowing, position]);

  useEffect(() => {
    if (isFollowing) {
      const handleClick = () => { setIsFollowing(false); localStorage.setItem('oshocks_toggle_position', JSON.stringify(position)); };
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isFollowing, position]);

  const handleToggle = (key) => {
    if (key === currentKey) { setIsExpanded(false); return; }
    setPendingKey(key);
    setShowNotification(true);
  };

  const handleConfirm = async () => {
    if (!pendingKey) return;
    setIsSwitching(true);
    try {
      await dataSourceManager.switchSource(pendingKey);
      const source = dataSourceManager.getCurrentSource();
      let message = `Switched to ${source.name}`;
      if (pendingKey === ENVIRONMENTS.HYBRID && source.hybridReason) {
        const actualSource = source.hybridReason.includes('local') ? 'Local' : 'Railway';
        message += ` — using ${actualSource}`;
      }
      toast.success(message, { duration: 3000 });
      window.dispatchEvent(new CustomEvent('refresh-data'));
      setShowNotification(false);
      setPendingKey(null);
      setIsExpanded(false);
    } catch (error) {
      toast.error('Failed to switch data source');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCancel = () => { setPendingKey(null); setShowNotification(false); };

  // EXACT Accella styling:
  // Container: bg-white rounded-lg shadow-lg border border-gray-200 p-2
  // Active: bg-{color}-50 text-{color}-700 (tinted bg, colored text)
  // Inactive: hover:bg-gray-100 text-gray-600
  // Icons: active gets color class, inactive is default/gray
  const sources = [
    { 
      key: ENVIRONMENTS.LOCAL, 
      label: 'Local', 
      icon: Server, 
      color: 'text-green-500',
      activeBg: 'bg-green-50',
      activeText: 'text-green-700'
    },
    { 
      key: ENVIRONMENTS.HYBRID, 
      label: 'Hybrid', 
      icon: Shuffle, 
      color: 'text-blue-500',
      activeBg: 'bg-blue-50',
      activeText: 'text-blue-700'
    },
    { 
      key: ENVIRONMENTS.PRODUCTION, 
      label: 'Railway', 
      icon: TrainFront, 
      color: 'text-orange-500',
      activeBg: 'bg-orange-50',
      activeText: 'text-orange-700'
    }
  ];

  const activeSource = sources.find(s => s.key === currentKey) || sources[2];

  return (
    <>
      <div
        ref={dragRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        className={`bg-white rounded-lg shadow-lg border border-gray-200 p-2 transition-all duration-300 select-none ${isDragging ? 'shadow-2xl' : 'hover:shadow-xl'}`}
      >
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <>
              {sources.map(({ key, label, icon: Icon, color, activeBg, activeText }) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); handleToggle(key); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${currentKey === key ? `${activeBg} ${activeText}` : 'hover:bg-gray-100 text-gray-600'}`}
                  title={key === ENVIRONMENTS.HYBRID ? 'Auto-detect best source' : `Switch to ${label}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${currentKey === key ? color : ''}`} />
                  <span>{label}</span>
                </button>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 text-gray-600 transition-all duration-200"
                title="Collapse"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${activeSource.activeBg} ${activeSource.activeText}`}
                title={`Current: ${activeSource.label}`}
              >
                <activeSource.icon className={`w-3.5 h-3.5 ${activeSource.color}`} />
                <span>{activeSource.label}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 text-gray-600 transition-all duration-200"
                title="Expand"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Green dot — EXACTLY like Accella: -top-1 -right-1, animate-pulse */}
        <div
          data-drag-handle
          onClick={handleGreenDotClick}
          className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform ${isFollowing ? 'bg-blue-500 scale-150' : 'bg-green-500'}`}
          title={isFollowing ? "Click anywhere to stop" : "Double tap to follow cursor"}
        />
      </div>

      {/* Confirmation Modal */}
      {showNotification && pendingKey && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Switch to {DEFAULT_SOURCES[pendingKey].name}?</h3>
            <p className="text-sm text-gray-600 mb-2">
              {pendingKey === ENVIRONMENTS.HYBRID 
                ? 'Will test both Local and Railway, then use the best available source.'
                : `API: ${DEFAULT_SOURCES[pendingKey].apiUrl}`
              }
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">
              Data will refresh automatically. No page reload needed!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={isSwitching}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSwitching ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {isSwitching ? 'Switching...' : 'Switch Now'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DraggableDataSourceToggle;