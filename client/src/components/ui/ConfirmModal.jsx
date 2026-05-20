import React from 'react';
import { useUIStore } from '../../store/uiStore';
import Button from './button';

const ConfirmModal = () => {
  const { confirm, hideConfirm } = useUIStore();

  if (!confirm) return null;

  const handleConfirm = () => {
    confirm.onConfirm();
    hideConfirm();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-[#0A0A0A]/10 backdrop-blur-[1px] animate-fade-in" onClick={hideConfirm}></div>
      
      <div className="relative bg-white dark:bg-vibaura-surface border border-[#F0F0F0] dark:border-white/5 rounded-[32px] p-8 max-w-[360px] w-full shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-scale-in">
        <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-text-primary mb-2 tracking-tighter uppercase">Are you sure?</h2>
        <p className="text-[#888] dark:text-text-muted mb-8 text-sm font-medium leading-relaxed">{confirm.message}</p>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleConfirm}
            className="w-full py-3.5 bg-vibaura-primary hover:brightness-110 text-white rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-vibaura-primary/20 uppercase tracking-tighter"
          >
            {confirm.confirmText || 'Yes, Confirm'}
          </button>
          <button 
            onClick={hideConfirm}
            className="w-full py-3 text-[#BBB] dark:text-text-muted hover:text-[#1A1A1A] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all uppercase tracking-tighter text-[10px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
