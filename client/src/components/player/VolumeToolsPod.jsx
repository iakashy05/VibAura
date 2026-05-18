import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faExpand } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const VolumeToolsPod = ({
  isCollapsed,
  queueButtonRef,
  isQueueOpen,
  setIsQueueOpen,
  isSubscribed,
  handleFullscreenClick,
  toggleMute,
  getVolumeIcon,
  volume,
  setVolume
}) => {
  return (
    <motion.div 
      initial={false}
      animate={{
        width: isCollapsed ? 120 : 240,
        padding: isCollapsed ? '0px 16px' : '0px 24px'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="pointer-events-auto flex items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-[28px] h-[64px] justify-between transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          ref={queueButtonRef}
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`transition-all active:scale-95 active:opacity-70 ${isQueueOpen ? 'text-vibaura-primary' : 'text-[#888] hover:text-[#1A1A1A]'}`}
          title="Queue"
        >
          <FontAwesomeIcon icon={faListUl} size="sm" />
        </button>
        <button
          onClick={handleFullscreenClick}
          className={`transition-all active:scale-95 active:opacity-70 ${!isSubscribed ? 'text-vibaura-primary animate-pulse' : 'text-[#888] hover:text-[#1A1A1A]'}`}
          title={isSubscribed ? "Fullscreen" : "Pro Feature: Fullscreen"}
        >
          <FontAwesomeIcon icon={faExpand} size="sm" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 group/volume relative flex-1 min-w-0 ml-3">
        <button
          onClick={toggleMute}
          className="w-5 flex justify-center text-[#888] hover:text-[#1A1A1A] transition-all active:scale-95 active:opacity-70 flex-shrink-0"
        >
          <FontAwesomeIcon icon={getVolumeIcon()} size="sm" />
        </button>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 relative flex items-center h-4 overflow-hidden"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/volume:h-2">
                <div
                  className="h-full bg-vibaura-primary rounded-full transition-all duration-200"
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover/volume:opacity-100 transition-all duration-300 shadow-lg pointer-events-none scale-0 group-hover/volume:scale-100"
                style={{ left: `calc(${volume * 100}% - 8px)` }}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VolumeToolsPod;
