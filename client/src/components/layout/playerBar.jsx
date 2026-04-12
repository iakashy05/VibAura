import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faStepForward, 
  faStepBackward, 
  faShuffle, 
  faRepeat,
  faVolumeUp,
  faExpand,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/button';

const PlayerBar = () => {
  return (
    <footer className="h-24 bg-vibaura-surface flex items-center justify-between px-6 z-20">
      
      {/* 1. Track Info Section */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="w-14 h-14 rounded-lg bg-vibaura-bg-muted overflow-hidden shadow-lg group cursor-pointer relative">
          <img src="https://placehold.co/100x100/d53f8c/FFFFFF?text=Aura" alt="Album" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-text-primary truncate hover:text-vibaura-pink cursor-pointer transition-colors">Select a Song</span>
          <span className="text-sm text-text-secondary truncate hover:text-vibaura-pink/80 cursor-pointer transition-colors">VibAura Artist</span>
        </div>
        <Button variant="ghost" size="icon" className="text-text-muted hover:text-vibaura-pink transition-colors">
          <FontAwesomeIcon icon={faHeart} size="sm" />
        </Button>
      </div>

      {/* 2. Main Playback Controls Center */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-full">
        <div className="flex items-center gap-6">
          <button className="text-text-muted hover:text-vibaura-pink transition-all active:scale-90"><FontAwesomeIcon icon={faShuffle} /></button>
          <button className="text-text-primary hover:text-vibaura-pink transition-all text-xl active:scale-90"><FontAwesomeIcon icon={faStepBackward} /></button>
          <Button size="icon" className="w-11 h-11 shadow-lg shadow-vibaura-pink/20 hover:scale-110"><FontAwesomeIcon icon={faPlay} className="ml-0.5" /></Button>
          <button className="text-text-primary hover:text-vibaura-pink transition-all text-xl active:scale-90"><FontAwesomeIcon icon={faStepForward} /></button>
          <button className="text-text-muted hover:text-vibaura-pink transition-all active:scale-90"><FontAwesomeIcon icon={faRepeat} /></button>
        </div>
        
        {/* Progress Bar Mockup */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] text-text-muted font-mono w-8">0:00</span>
          <div className="flex-1 h-1.5 bg-vibaura-bg-pink rounded-full overflow-hidden relative group cursor-pointer">
             <div className="absolute top-0 left-0 h-full w-1/3 bg-vibaura-pink group-hover:bg-vibaura-pink-hover transition-colors shadow-[0_0_8px_rgba(255,0,128,0.5)]"></div>
          </div>
          <span className="text-[10px] text-text-muted font-mono w-8 text-right">3:45</span>
        </div>
      </div>

      {/* 3. Volume & Tools Section */}
      <div className="flex items-center justify-end gap-4 w-[30%] text-text-secondary">
        <button className="hover:text-vibaura-pink transition-colors active:scale-90"><FontAwesomeIcon icon={faExpand} size="sm" /></button>
        <div className="flex items-center gap-3 w-32 group">
          <FontAwesomeIcon icon={faVolumeUp} size="sm" className="group-hover:text-vibaura-pink transition-colors" />
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="75"
            className="volume-slider flex-1"
          />
        </div>
      </div>

    </footer>
  );
};

export default PlayerBar;
