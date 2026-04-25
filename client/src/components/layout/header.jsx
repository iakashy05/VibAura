import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faHome,
  faSearch, 
  faSun,
  faMusic,
  faTimes,
  faSignOutAlt,
  faUserCircle,
  faCog,
  faChevronDown,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import Input from '../ui/input';
import Button from '../ui/button';

import { useAuthStore } from '../../store/authStore';
import Dropdown from '../ui/Dropdown';

const Header = ({ onNavigate, goBack, goForward, canGoBack, canGoForward, searchQuery, setSearchQuery }) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuthStore();

  // Derive avatar letter — prefer name, fallback to email
  const displayName = user?.name || user?.email || 'Aura User';
  const avatarLetter = displayName[0].toUpperCase();

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounce logic: wait 300ms after last keystroke before triggering search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Keyboard Shortcuts: Ctrl+K or / to focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    
    // Auto-navigate to search page when typing starts
    if (val.trim().length > 0) {
      onNavigate('search');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(localQuery);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setLocalQuery('');
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <header className="h-20 flex items-center px-8 bg-vibaura-surface transition-all duration-300">
      
      {/* 1. Left Section: Branding & Navigation Controls */}
      <div className="flex-1 flex items-center gap-6">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 px-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-11 h-11 bg-vibaura-primary rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-vibaura-primary/20 transition-transform group-hover:scale-110">
            <FontAwesomeIcon icon={faMusic} className="text-lg" />
          </div>
          <span className="text-2xl font-bold text-text-primary tracking-tight hidden md:block">VibAura</span>
        </div>
 
        <div className="h-6 w-[1px] bg-vibaura-border ml-2" />
 
        <div className="flex gap-2.5 pl-4">
          <IconButton 
            icon={faChevronLeft} 
            onClick={goBack} 
            className={!canGoBack ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''} 
          />
          <IconButton 
            icon={faChevronRight} 
            onClick={goForward} 
            className={!canGoForward ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''} 
          />
          <IconButton 
            icon={faHome} 
            className="ml-2 !bg-vibaura-primary !text-white shadow-lg !border-none" 
            onClick={() => onNavigate('home')}
          />
        </div>
      </div>

      {/* 2. Center Section: Search Bar */}
      <div className="flex-[2] flex justify-center">
        <div className="w-full max-w-lg px-4 relative group/search">
          <Input 
            ref={inputRef}
            placeholder="Search for magic..." 
            icon={<FontAwesomeIcon icon={faSearch} size="sm" className="text-[#999] group-focus-within/search:text-vibaura-primary transition-colors" />}
            inputClassName="!py-3.5 !rounded-[24px] !bg-white !border-black/5 !text-sm !pl-14 !shadow-none focus:!bg-white focus:!border-vibaura-primary/30 focus:!shadow-none transition-all" 
            value={localQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          
          {/* Keyboard Hint */}
          {!localQuery && (
             <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1 items-center pointer-events-none opacity-20 hidden md:flex">
                <span className="px-1.5 py-0.5 rounded bg-vibaura-bg-muted text-[10px] font-bold border border-vibaura-border">Ctrl</span>
                <span className="px-1.5 py-0.5 rounded bg-vibaura-bg-muted text-[10px] font-bold border border-vibaura-border">K</span>
             </div>
          )}

          {/* Clear Button */}
          {localQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-vibaura-primary-light hover:text-vibaura-primary transition-all text-text-muted"
            >
              <FontAwesomeIcon icon={faTimes} size="xs" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Right Section: Theme & Profile */}
      <div className="flex-1 flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-text-secondary">
          <FontAwesomeIcon icon={faSun} />
        </Button>
        
        <div className="h-6 w-[1px] bg-vibaura-border mx-2" />

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-11 h-11 rounded-[14px] bg-vibaura-primary flex items-center justify-center text-white font-black text-sm active:scale-95 group relative transition-all duration-300"
            aria-label="User menu"
          >
            {avatarLetter}
          </button>

          <Dropdown 
            isOpen={menuOpen} 
            onClose={() => setMenuOpen(false)}
            positionClass="right-0 top-[calc(100%+12px)]"
            className="w-64"
          >
            {/* User Info Header */}
            <div className="px-6 py-5 bg-[#F8F9FA] border-b border-[#F0F0F0]">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-vibaura-primary flex items-center justify-center text-white font-black text-lg shrink-0">
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#1A1A1A] truncate uppercase tracking-tighter leading-none">{displayName}</p>
                  <p className="text-[10px] text-[#999] uppercase font-black tracking-tighter mt-1">{user?.role || 'Member'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1">
              <MenuItem icon={faUserCircle} label="My Profile" sublabel="View and edit your profile" onClick={() => { setMenuOpen(false); }} />
              <MenuItem icon={faBell} label="Notifications" sublabel="Coming soon" onClick={() => { setMenuOpen(false); }} muted />
              <MenuItem icon={faCog} label="Settings" sublabel="App preferences" onClick={() => { setMenuOpen(false); }} muted />
            </div>

            {/* Divider + Logout */}
            <div className="p-3 border-t border-[#F0F0F0]">
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 transition-colors">
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                </div>
                <span className="text-xs font-black uppercase tracking-tighter">Log Out</span>
              </button>
            </div>
          </Dropdown>
        </div>
      </div>

    </header>
  );
};

const MenuItem = ({ icon, label, sublabel, onClick, muted = false }) => (
  <button
    onClick={onClick}
    disabled={muted}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group text-left
      ${muted
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:bg-gray-50'
      }`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0
      ${muted ? 'bg-gray-100 text-[#CCC]' : 'bg-[#F5F5F7] text-[#999] group-hover:text-vibaura-primary'}`}
    >
      <FontAwesomeIcon icon={icon} className="text-xs" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-black text-[#1A1A1A] leading-none uppercase tracking-tighter">{label}</p>
      <p className="text-[9px] text-[#999] font-black uppercase tracking-tighter mt-1 truncate">{sublabel}</p>
    </div>
    {muted && (
      <span className="ml-auto text-[8px] font-black uppercase tracking-tighter text-[#CCC] bg-gray-50 px-2 py-1 rounded-full shrink-0">
        Soon
      </span>
    )}
  </button>
);

const IconButton = ({ icon, className = '', onClick }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-11 flex items-center justify-center rounded-[14px] bg-[#F5F5F7] border border-black/5 text-[#999] hover:text-vibaura-primary hover:bg-white hover:border-vibaura-primary/30 transition-all duration-300 group shadow-sm ${className}`}
  >
    <FontAwesomeIcon icon={icon} className="text-sm group-hover:scale-110 transition-transform" />
  </button>
);

export default Header;
