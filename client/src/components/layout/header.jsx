import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faHome,
  faSearch, 
  faUser,
  faSun,
  faMusic
} from '@fortawesome/free-solid-svg-icons';
import Input from '../ui/input';
import Button from '../ui/button';

const Header = ({ onNavigate }) => {
  return (
    <header className="h-16 flex items-center px-8 bg-vibaura-surface transition-all duration-300">
      
      {/* 1. Left Section: Branding & Navigation Controls */}
      <div className="flex-1 flex items-center gap-6">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 px-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-9 h-9 bg-vibaura-pink rounded-xl flex items-center justify-center text-white shadow-lg shadow-vibaura-pink/20 transition-transform group-hover:scale-110">
            <FontAwesomeIcon icon={faMusic} size="sm" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight hidden md:block">VibAura</span>
        </div>

        <div className="h-6 w-[1px] bg-vibaura-border ml-2" />

        <div className="flex gap-2 pl-4">
          <IconButton icon={faChevronLeft} />
          <IconButton icon={faChevronRight} />
          <IconButton 
            icon={faHome} 
            className="ml-2 !bg-vibaura-pink !text-white shadow-lg" 
            onClick={() => onNavigate('home')}
          />
        </div>
      </div>

      {/* 2. Center Section: Search Bar (Now perfectly centered) */}
      <div className="flex-[2] flex justify-center">
        <div className="w-full max-w-md px-4">
          <Input 
            placeholder="Search for magic..." 
            icon={<FontAwesomeIcon icon={faSearch} size="sm" />}
            className="!py-0.5" 
          />
        </div>
      </div>

      {/* 3. Right Section: Theme & Profile */}
      <div className="flex-1 flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-text-secondary">
          <FontAwesomeIcon icon={faSun} />
        </Button>
        
        <div className="h-6 w-[1px] bg-vibaura-border mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-vibaura-pink-light flex items-center justify-center text-vibaura-pink border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:rotate-12 hover:scale-110 transition-all duration-300">
             <FontAwesomeIcon icon={faUser} />
          </div>
          <span className="font-semibold text-sm text-text-primary hidden lg:block">Aura User</span>
        </div>
      </div>

    </header>
  );
};

const IconButton = ({ icon, className = '', onClick }) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded-full bg-vibaura-bg-muted text-text-secondary hover:text-vibaura-pink hover:bg-vibaura-pink-light transition-all duration-200 shadow-sm ${className}`}
  >
    <FontAwesomeIcon icon={icon} size="sm" />
  </button>
);

export default Header;
