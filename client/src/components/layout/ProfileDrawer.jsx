import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faUserCircle, faWaveSquare, faBell, faCog, faSignOutAlt, faCrown
} from '@fortawesome/free-solid-svg-icons';

/**
 * ProfileDrawer Component
 * A premium mobile drawer that slides out from the right using Framer Motion.
 */
const ProfileDrawer = ({ isOpen, onClose, user, isSubscribed, onNavigate, onLogout }) => {
  const drawerRef = useRef(null);

  // Close drawer on clicking outside the drawer pane
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Derive avatar letter
  const displayName = user?.name || user?.email || 'Aura User';
  const avatarLetter = displayName[0].toUpperCase();

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.12 } }
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] } // Snappy ease-out tween
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Shadow overlay */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
          />

          {/* Sliding Panel */}
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 right-0 bottom-0 w-[270px] z-[101] bg-white flex flex-col shadow-2xl border-l border-black/5"
          >
            {/* Header with close option */}
            <div className="flex items-center justify-between p-4 border-b border-black/[0.04]">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-primary pl-1">Settings</span>
              <button 
                onClick={onClose} 
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 text-[#999] hover:text-[#1A1A1A] transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            </div>

            {/* Premium Compact Horizontal User Details */}
            <div className="flex items-center gap-3.5 p-4 border-b border-black/[0.03] bg-vibaura-view-bg/50">
              <div className="relative shrink-0 p-0.5">
                {isSubscribed && (
                  <div className="absolute inset-0 rounded-[12px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
                )}
                <div className={`relative w-11 h-11 rounded-[10px] bg-vibaura-primary flex items-center justify-center text-white font-black text-lg shadow-sm z-10 ${isSubscribed ? 'border-2 border-vibaura-view-bg' : ''}`}>
                  {avatarLetter}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-[#1A1A1A] tracking-tight truncate leading-tight">{displayName}</h3>
                <p className="text-[8px] text-vibaura-primary font-black tracking-widest uppercase mt-0.5">
                  {isSubscribed ? '👑 Pro Member' : (user?.role || 'Basic Aura')}
                </p>
              </div>
            </div>

            {/* Menu Items Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {/* Pro Promotion (if not subscribed) */}
              {!isSubscribed && (
                <button
                  onClick={() => { onNavigate('payment'); onClose(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-tr from-vibaura-primary to-indigo-600 text-white shadow-md active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm shrink-0">
                    <FontAwesomeIcon icon={faCrown} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider">Unlock Pro Vibe</h4>
                    <p className="text-[9px] font-medium opacity-80 mt-0.5">Host VibSync rooms and get infinite playback.</p>
                  </div>
                </button>
              )}

              {/* Vibrance Link */}
              <button
                onClick={() => { onNavigate('vibrance'); onClose(); }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-black/5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-vibaura-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <FontAwesomeIcon icon={faWaveSquare} className="text-xs animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1A] leading-none tracking-tight">Vibrance Reports</h4>
                  <p className="text-[9px] text-[#999] font-bold tracking-tight mt-1">Check your monthly sound profile</p>
                </div>
              </button>

              <hr className="border-black/[0.05] my-2" />

              <MenuItem icon={faUserCircle} label="My Profile" sublabel="Your general profile metadata" onClick={onClose} />
              <MenuItem icon={faBell} label="Notifications" sublabel="Coming soon" onClick={onClose} muted />
              <MenuItem icon={faCog} label="Settings" sublabel="App parameters" onClick={onClose} muted />
            </div>

            {/* Logout Action */}
            <div className="p-4 border-t border-black/[0.05]">
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 active:scale-[0.98] transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors shrink-0">
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                </div>
                <span className="text-xs font-black tracking-tight">Log Out of VibAura</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MenuItem = ({ icon, label, sublabel, onClick, muted = false }) => (
  <button
    onClick={onClick}
    disabled={muted}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-left group
      ${muted ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black/5'}`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors
      ${muted ? 'bg-gray-100 text-[#CCC]' : 'bg-vibaura-view-bg text-[#999] group-hover:text-vibaura-primary'}`}
    >
      <FontAwesomeIcon icon={icon} className="text-xs" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-black text-[#1A1A1A] leading-none tracking-tight">{label}</p>
      <p className="text-[9px] text-[#999] font-bold tracking-tight mt-1 truncate">{sublabel}</p>
    </div>
    {muted && (
      <span className="ml-auto text-[7px] font-black uppercase text-[#CCC] bg-gray-50 px-2 py-0.5 rounded-full shrink-0">
        Soon
      </span>
    )}
  </button>
);

export default ProfileDrawer;
