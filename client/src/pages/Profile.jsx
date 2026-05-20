import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faWaveSquare, faSignOutAlt, faCrown, faArrowRight, faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

/**
 * Profile Component
 * A beautiful, full-screen dedicated account settings page.
 * Adapts beautifully to Dark and Light modes.
 */
const Profile = ({ onNavigate }) => {
  const { user, isSubscribed, logout } = useAuthStore();
  const { theme, toggleTheme, showToast } = useUIStore();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
  };

  const displayName = user?.name || user?.email || 'Aura User';
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-40 md:pb-32 animate-page-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase">Your Account</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-1">Manage your aura settings</p>
      </div>

      {/* User Details Spotlight Card */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-vibaura-surface border border-black/[0.03] dark:border-white/5 shadow-md flex items-center gap-4 transition-all duration-300">
        {/* Pro member background highlights */}
        {isSubscribed && (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-50 pointer-events-none" />
        )}
        
        <div className="relative shrink-0 p-0.5">
          {isSubscribed && (
            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
          )}
          <div className={`relative w-16 h-16 rounded-[16px] bg-vibaura-primary flex items-center justify-center text-white font-black text-2xl shadow-sm z-10 ${isSubscribed ? 'border-2 border-white dark:border-vibaura-surface' : ''}`}>
            {avatarLetter}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-text-primary tracking-tight truncate leading-tight">{displayName}</h2>
          <p className="text-[9px] text-text-muted font-bold truncate mt-0.5">{user?.email || 'No email registered'}</p>
          <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-[8px] font-black uppercase tracking-wider bg-vibaura-primary/5 dark:bg-vibaura-primary/15 text-vibaura-primary dark:text-vibaura-primary-light">
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
        <h3 className="text-xs font-black uppercase text-text-muted tracking-wider mb-2">Options</h3>
        
        {/* My Profile Option */}
        <button
          onClick={() => onNavigate('profile')}
          className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-vibaura-surface border border-black/[0.03] dark:border-white/5 active:scale-[0.99] hover:bg-black/[0.01] dark:hover:bg-white/5 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-vibaura-view-bg dark:bg-vibaura-bg-muted/10 text-[#999] dark:text-text-secondary group-hover:bg-vibaura-primary dark:group-hover:bg-vibaura-primary group-hover:text-white dark:group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <FontAwesomeIcon icon={faUserCircle} className="text-xs" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-text-primary leading-none tracking-tight">My Profile</h4>
            <p className="text-[9px] text-text-muted font-bold tracking-tight mt-1 truncate">Your general profile metadata</p>
          </div>
        </button>

        {/* Vibrance Report Option */}
        <button
          onClick={() => onNavigate('vibrance')}
          className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-vibaura-surface border border-black/[0.03] dark:border-white/5 active:scale-[0.99] hover:bg-black/[0.01] dark:hover:bg-white/5 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 group-hover:bg-vibaura-primary dark:group-hover:bg-vibaura-primary group-hover:text-white dark:group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <FontAwesomeIcon icon={faWaveSquare} className="text-xs animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-text-primary leading-none tracking-tight">Vibrance Reports</h4>
            <p className="text-[9px] text-text-muted font-bold tracking-tight mt-1 truncate">Analyze your personal monthly sound profile</p>
          </div>
        </button>

        {/* Theme Toggle Option */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-vibaura-surface border border-black/[0.03] dark:border-white/5 active:scale-[0.99] hover:bg-black/[0.01] dark:hover:bg-white/5 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 group-hover:bg-vibaura-primary dark:group-hover:bg-vibaura-primary group-hover:text-white dark:group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-xs" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-text-primary leading-none tracking-tight">
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </h4>
            <p className="text-[9px] text-text-muted font-bold tracking-tight mt-1 truncate">
              {theme === 'dark' ? 'Go bright and clear' : 'Go dark and immersive'}
            </p>
          </div>
        </button>
      </div>

      {/* Log Out Action */}
      <div className="pt-4 px-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/10 text-red-500 border border-red-500/5 dark:border-red-950/20 active:scale-[0.98] hover:bg-red-100/20 dark:hover:bg-red-950/20 transition-all group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100/50 dark:bg-red-950/30 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shrink-0">
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

export default Profile;
