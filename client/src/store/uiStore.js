import { create } from 'zustand';

export const useUIStore = create((set) => ({
  toast: null, // { message: string, type: 'success' | 'error' | 'info', id: number }
  
  showToast: (message, type = 'info') => {
    const id = Date.now();
    set({ toast: { message, type, id } });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : {}));
    }, 3000);
  },
  
  hideToast: () => set({ toast: null }),

  // Confirmation Modal
  confirm: null, // { title: string, message: string, onConfirm: function }
  
  showConfirm: (title, message, onConfirm, confirmText = 'Yes, Confirm') => {
    set({ confirm: { title, message, onConfirm, confirmText } });
  },
  
  hideConfirm: () => set({ confirm: null }),
  
  // Responsive State
  isSidebarCollapsed: window.innerWidth < 1200,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  // Global Menu Management
  activeMenuId: null,
  setActiveMenuId: (id) => set({ activeMenuId: id }),

  // Network State
  isServerOffline: false,
  setServerOffline: (offline) => set({ isServerOffline: offline })
}));
