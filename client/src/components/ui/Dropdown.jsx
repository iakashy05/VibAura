import React, { useEffect, useRef } from 'react';

/**
 * A unified, minimalist dropdown container that follows the app's flat design.
 * Handles clicking outside and standard animations.
 */
const Dropdown = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '', 
  positionClass = 'right-0 top-12',
  minWidth = '200px'
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
      className={`absolute z-[100] bg-white border border-black/5 rounded-[24px] shadow-none overflow-hidden animate-scale-in p-1.5 ${positionClass} ${className}`}
      style={{ minWidth }}
    >
      {children}
    </div>
  );
};

export default Dropdown;
