import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faWaveSquare, faBell, faCog, faSignOutAlt, faCrown, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

/**
 * Profile Component
 * A beautiful, full-screen dedicated account settings page.
 */
const Profile = ({ onNavigate }) => {
  const { user, isSubscribed, logout } = useAuthStore();
  const { showToast } = useUIStore();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
  };

  const displayName = user?.name || user?.email || 'Aura User';
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 animate-page-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase">Your Account</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-1">Manage your aura settings</p>
      </div>

      {/* User Details Spotlight Card */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-white to-[#F9F5F6] border border-black/[0.03] shadow-md flex items-center gap-4">
        {/* Pro member background highlights */}
        {isSubscribed && (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50 pointer-events-none" />
        )}
        
        <div className="relative shrink-0 p-0.5">
          {isSubscribed && (
            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
          )}
          <div className={`relative w-16 h-16 rounded-[16px] bg-vibaura-primary flex items-center justify-center text-white font-black text-2xl shadow-sm z-10 ${isSubscribed ? 'border-2 border-white' : ''}`}>
            {avatarLetter}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-[#1A1A1A] tracking-tight truncate leading-tight">{displayName}</h2>
          <p className="text-[9px] text-[#888] font-bold truncate mt-0.5">{user?.email || 'No email registered'}</p>
          <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-[8px] font-black uppercase tracking-wider bg-vibaura-primary/5 text-vibaura-primary">
            {isSubscribed ? '👑 Pro Member' : (user?.role || 'Basic Aura')}
          </span>
        </div>
      </div>

      {/* Pro Promotion Banner (If basic member) */}
      {!isSubscribed && (
        <button
          onClick={() => onNavigate('payment')}
          className="w-full flex items-center gap-4 p-5 rounded-[32px] bg-gradient-to-tr from-vibaura-primary to-indigo-600 text-white shadow-xl shadow-vibaura-primary/10 active:scale-[0.99] transition-all text-left relative overflow-hidden group"
        >
          <div className="absolute right-4 bottom-0 text-white/5 text-8xl font-black pointer-events-none group-hover:scale-110 transition-transform duration-500 select-none">
            👑
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-base shrink-0">
            <FontAwesomeIcon icon={faCrown} />
          </div>
          <div className="flex-1">
            <h4 className="text-[12px] font-black uppercase tracking-wider">Upgrade to Pro Aura</h4>
            <p className="text-[9px] font-medium opacity-80 mt-1">Host VibSync listening rooms and unlimited playlists.</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="text-white/70 group-hover:translate-x-1 transition-transform ml-2 shrink-0" />
        </button>
      )}

      {/* Main Settings Menu options */}
      <div className="space-y-3 px-1">
        <h3 className="text-xs font-black uppercase text-[#999] tracking-wider mb-2">Options</h3>
        
        {/* Vibrance Report Option */}
        <button
          onClick={() => onNavigate('vibrance')}
          className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white border border-black/[0.03] active:scale-[0.99] hover:bg-black/[0.01] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-vibaura-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <FontAwesomeIcon icon={faWaveSquare} className="text-xs animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-[#1A1A1A] leading-none tracking-tight">Vibrance Monthly Report</h4>
            <p className="text-[9px] text-[#999] font-bold tracking-tight mt-1 truncate">Analyze your personal sound profile</p>
          </div>
        </button>

        <MenuItem icon={faUserCircle} label="My Profile" sublabel="View your username, email, and preferences" />
        <MenuItem icon={faBell} label="Notifications" sublabel="Aura push and message notifications" muted />
        <MenuItem icon={faCog} label="Settings" sublabel="Application parameters and audio quality" muted />
      </div>

      {/* Log Out Action */}
      <div className="pt-4 px-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 rounded-2xl bg-red-50 text-red-500 border border-red-500/5 active:scale-[0.98] transition-all group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100/50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shrink-0">
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-black tracking-tight block">Log Out of VibAura</span>
            <span className="text-[9px] text-red-400 font-bold block mt-0.5">Disconnect from this device</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, sublabel, muted = false }) => (
  <div
    className={`w-full flex items-center gap-4 p-3 rounded-2xl bg-white border border-black/[0.03] transition-all text-left relative
      ${muted ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black/[0.01]'}`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
      ${muted ? 'bg-gray-100 text-[#CCC]' : 'bg-vibaura-view-bg text-[#999] group-hover:text-vibaura-primary'}`}
    >
      <FontAwesomeIcon icon={icon} className="text-xs" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-black text-[#1A1A1A] leading-none tracking-tight">{label}</p>
      <p className="text-[9px] text-[#999] font-bold tracking-tight mt-1 truncate">{sublabel}</p>
    </div>
    {muted && (
      <span className="ml-auto text-[7px] font-black uppercase text-[#CCC] bg-gray-50 px-2 py-0.5 rounded-full shrink-0">
        Soon
      </span>
    )}
  </div>
);

export default Profile;
