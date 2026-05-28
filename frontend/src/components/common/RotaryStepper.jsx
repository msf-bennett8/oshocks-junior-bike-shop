import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * RotaryStepper — Stepper with [-] [input] [+] + 180° rotary dial
 * No max limit — users can type any number. Buttons increment/decrement by 1.
 */
const RotaryStepper = ({ value, onChange, min = 1, label, unit = '' }) => {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef(null);

  // Sync display value when prop changes (but not while user is typing)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(value);
    }
  }, [value]);

  const clamp = (val) => Math.max(min, val);

  const handleDecrement = () => {
    const newVal = clamp(value - 1);
    onChange(newVal);
  };

  const handleIncrement = () => {
    const newVal = value + 1;
    onChange(newVal);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setDisplayValue(raw);
  };

  const handleInputBlur = () => {
    if (displayValue === '' || displayValue === '-') {
      setDisplayValue(value);
      return;
    }
    const num = parseInt(displayValue, 10);
    if (!isNaN(num)) {
      const clamped = clamp(num);
      onChange(clamped);
      setDisplayValue(clamped);
    } else {
      setDisplayValue(value);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const getAngleFromPoint = useCallback((clientX, clientY) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    const angle = getAngleFromPoint(e.clientX, e.clientY);
    setStartAngle(angle);
    setStartValue(value);
    setIsDragging(true);
    dialRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentAngle = getAngleFromPoint(e.clientX, e.clientY);
    let deltaAngle = currentAngle - startAngle;
    
    // Normalize delta to handle the -180/180 wrap-around
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    // Sensitivity: 10 degrees = 1 unit change
    const valueDelta = Math.round(-deltaAngle / 10);
    const newValue = clamp(startValue + valueDelta);
    
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [isDragging, startAngle, startValue, value, min, getAngleFromPoint, onChange]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    if (dialRef.current) {
      try {
        dialRef.current.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Visual rotation: cap at a reasonable display angle (0-180°)
  // For values > 50, we just keep the dial at max visual rotation
  const displayMax = 50;
  const visualValue = Math.min(value, displayMax);
  const visualRange = displayMax - min;
  const valuePercent = Math.max(0, (visualValue - min) / visualRange);
  const rotationAngle = 180 - (valuePercent * 180);

  const radius = 40;
  const center = 48;
  const indicatorX = center + radius * Math.cos((rotationAngle * Math.PI) / 180);
  const indicatorY = center + radius * Math.sin((rotationAngle * Math.PI) / 180);

  // Arc path: from 180° (left) to 0° (right) — bottom semi-circle
  const arcStartX = center + radius * Math.cos(Math.PI);        // left
  const arcStartY = center + radius * Math.sin(Math.PI);        // center y
  const arcEndX = center + radius * Math.cos(0);               // right
  const arcEndY = center + radius * Math.sin(0);               // center y

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      
      <div className="flex items-center gap-3">
        {/* Stepper + Input Block */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-16 h-9 text-center font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base tabular-nums"
            aria-label={`${label || 'Value'} input`}
          />
          
          <button
            type="button"
            onClick={handleIncrement}
            className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-orange-300 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rotary Dial */}
        <div 
          ref={dialRef}
          onPointerDown={handlePointerDown}
          className={`relative w-24 h-14 flex-shrink-0 cursor-grab ${isDragging ? 'cursor-grabbing' : ''} select-none touch-none`}
          style={{ touchAction: 'none' }}
        >
          <svg viewBox="0 0 96 56" className="w-full h-full overflow-visible">
            {/* Background arc (180° semi-circle, bottom) */}
            <path
              d={`M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 0 1 ${arcEndX} ${arcEndY}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
              strokeLinecap="round"
            />
            
            {/* Active arc */}
            <path
              d={`M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 0 1 ${indicatorX} ${indicatorY}`}
              fill="none"
              stroke="url(#dialGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            
            {/* Min marker (180° / left) */}
            <circle cx={arcStartX} cy={arcStartY} r="2.5" fill="#9ca3af" />
            <text x={arcStartX - 8} y={arcStartY + 10} className="text-[7px] fill-gray-400" textAnchor="middle">{min}</text>
            
            {/* Max marker (0° / right) */}
            <circle cx={arcEndX} cy={arcEndY} r="2.5" fill="#9ca3af" />
            <text x={arcEndX + 8} y={arcEndY + 10} className="text-[7px] fill-gray-400" textAnchor="middle">∞</text>
            
            {/* Indicator handle */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="6"
              fill="#fff"
              stroke="#f97316"
              strokeWidth="2.5"
              className={isDragging ? 'drop-shadow-md' : ''}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <p className="text-xs text-gray-400">
        Drag dial to adjust • Type any number directly
      </p>
    </div>
  );
};

export default RotaryStepper;
