'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  delay = 100,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    if (position === 'top') {
      top = rect.top + window.scrollY - gap;
      left = rect.left + window.scrollX + rect.width / 2;
    } else if (position === 'bottom') {
      top = rect.bottom + window.scrollY + gap;
      left = rect.left + window.scrollX + rect.width / 2;
    } else if (position === 'left') {
      top = rect.top + window.scrollY + rect.height / 2;
      left = rect.left + window.scrollX - gap;
    } else if (position === 'right') {
      top = rect.top + window.scrollY + rect.height / 2;
      left = rect.right + window.scrollX + gap;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const transformClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2 translate-y-0',
    left: '-translate-x-full -translate-y-1/2',
    right: 'translate-x-0 -translate-y-1/2',
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {mounted && isVisible && content && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className={`fixed z-[9999] pointer-events-none px-3 py-1.5 text-[11px] font-medium text-slate-100 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-md whitespace-nowrap transition-all duration-150 animate-in fade-in zoom-in-95 ${transformClasses[position]}`}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
