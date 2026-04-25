import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../store/uiStore';

const Toast = () => {
  const { toast, hideToast } = useUIStore();

  if (!toast) return null;

  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faInfoCircle
  };

  const colors = {
    success: 'bg-white text-[#1DB954] border-green-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    error: 'bg-white text-[#E91E63] border-red-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    info: 'bg-white text-vibaura-primary border-vibaura-border/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)]'
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-in">
      <div className={`flex items-center gap-4 px-8 py-4 rounded-full border shadow-2xl ${colors[toast.type]}`}>
        <FontAwesomeIcon icon={icons[toast.type]} className="text-lg" />
        <span className="font-bold tracking-tight whitespace-nowrap uppercase text-xs text-[#1A1A1A]">
          {toast.message}
        </span>
        <button 
          onClick={hideToast}
          className="ml-2 opacity-30 hover:opacity-100 transition-opacity text-[#1A1A1A]"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
