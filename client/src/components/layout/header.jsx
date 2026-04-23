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
    <header className="h-16 flex items-center px-8 bg-vibaura-surface transition-all duration-300">
      
      {/* 1. Left Section: Branding & Navigation Controls */}
      <div className="flex-1 flex items-center gap-6">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 px-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-9 h-9 bg-vibaura-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-vibaura-primary/20 transition-transform group-hover:scale-110">
            <FontAwesomeIcon icon={faMusic} size="sm" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight hidden md:block">VibAura</span>
        </div>
 
        <div className="h-6 w-[1px] bg-vibaura-border ml-2" />
 
        <div className="flex gap-2 pl-4">
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
            className="ml-2 !bg-vibaura-primary !text-white shadow-lg" 
            onClick={() => onNavigate('home')}
          />
        </div>
      </div>

      {/* 2. Center Section: Search Bar */}
      <div className="flex-[2] flex justify-center">
        <div className="w-full max-w-md px-4 relative">
          <Input 
            ref={inputRef}
            placeholder="Search for magic..." 
            icon={<FontAwesomeIcon icon={faSearch} size="sm" />}
            className="!py-0.5" 
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
            className="flex items-center gap-2 p-1 rounded-full hover:bg-vibaura-bg-muted transition-all duration-200 group"
            aria-label="User menu"
          >
            {/* Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-vibaura-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-vibaura-primary/30 select-none group-hover:scale-105 transition-transform">
              {avatarLetter}
            </div>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`text-text-muted text-[10px] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Context Menu Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-60 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-vibaura-border/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* User Info Header */}
              <div className="px-4 py-3.5 bg-vibaura-bg-muted/60 border-b border-vibaura-border/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-vibaura-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-text-primary truncate">{displayName}</p>
                    <p className="text-[10px] text-text-muted capitalize font-semibold mt-0.5">{user?.role || 'Member'}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1.5 space-y-0.5">
                <MenuItem icon={faUserCircle} label="My Profile" sublabel="View and edit your profile" onClick={() => { setMenuOpen(false); }} />
                <MenuItem icon={faBell} label="Notifications" sublabel="Coming soon" onClick={() => { setMenuOpen(false); }} muted />
                <MenuItem icon={faCog} label="Settings" sublabel="App preferences" onClick={() => { setMenuOpen(false); }} muted />
              </div>

              {/* Divider + Logout */}
              <div className="p-1.5 border-t border-vibaura-border/20">
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-150 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                  </div>
                  <span className="text-sm font-bold">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

const MenuItem = ({ icon, label, sublabel, onClick, muted = false }) => (
  <button
    onClick={onClick}
    disabled={muted}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group text-left
      ${muted
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:bg-vibaura-bg-muted'
      }`}
  >
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0
      ${muted ? 'bg-gray-100 text-gray-400' : 'bg-vibaura-bg-muted group-hover:bg-vibaura-primary-light text-text-muted group-hover:text-vibaura-primary'}`}
    >
      <FontAwesomeIcon icon={icon} className="text-xs" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-text-primary leading-none">{label}</p>
      <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate">{sublabel}</p>
    </div>
    {muted && (
      <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-text-muted bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
        Soon
      </span>
    )}
  </button>
);

const IconButton = ({ icon, className = '', onClick }) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded-full bg-vibaura-bg-muted text-text-secondary hover:text-vibaura-primary hover:bg-vibaura-primary-light transition-all duration-200 shadow-sm ${className}`}
  >
    <FontAwesomeIcon icon={icon} size="sm" />
  </button>
);

export default Header;
