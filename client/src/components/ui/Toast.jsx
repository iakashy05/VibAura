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
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-indigo-400'
  };

  return (
    <div 
      className="fixed top-8 z-[10000] animate-toast-fade pointer-events-none"
      style={{ left: 'calc(var(--sidebar-width) / 2 + 50%)' }}
    >
      <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-lg shadow-2xl border border-white/5">
        <FontAwesomeIcon icon={icons[toast.type]} className={`text-sm ${colors[toast.type]}`} />
        <span className="font-bold tracking-wide whitespace-nowrap text-[11px] text-white">
          {toast.message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
