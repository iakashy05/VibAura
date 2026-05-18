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
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] animate-toast-fade pointer-events-none"
    >
      <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black border border-white/10">
        <FontAwesomeIcon icon={icons[toast.type]} className={`text-sm ${colors[toast.type]}`} />
        <span className="font-bold tracking-wide whitespace-nowrap text-[11px] text-white">
          {toast.message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
