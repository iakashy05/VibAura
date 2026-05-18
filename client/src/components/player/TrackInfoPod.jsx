import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LikeButton from '../ui/LikeButton';

const TrackInfoPod = ({ currentTrack, isLiked, isCollapsed, handleLikeClick, handleFullscreenClick }) => {
  return (
    <motion.div
      onClick={handleFullscreenClick}
      layout
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 280,
        padding: isCollapsed ? '0px' : '10px',
        borderRadius: isCollapsed ? '32px' : '28px'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="pointer-events-auto flex items-center bg-white/80 backdrop-blur-xl border border-white/50 h-[64px] transition-all duration-500 cursor-pointer group/info shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden justify-center"
    >
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 10s linear 1;
            animation-fill-mode: forwards;
          }
          .group\\/info:hover .animate-marquee {
            animation-iteration-count: infinite;
          }
        `}
      </style>
      <div className={`rounded-[20px] bg-vibaura-bg-muted overflow-hidden relative flex-shrink-0 border border-black/5 transition-all duration-500 ${isCollapsed ? 'w-14 h-14' : 'w-11 h-11 ml-0.5'}`}>
        <img
          src={currentTrack?.albumArt || currentTrack?.image || "https://placehold.co/100x100/6367FF/FFFFFF?text=Aura"}
          alt="Album"
          className="w-full h-full object-cover transition-transform duration-700 group-hover/info:scale-110"
        />
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center flex-1 min-w-0"
          >
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden ml-3">
              <span className="font-bold text-[#1A1A1A] truncate text-[13px] tracking-tight leading-tight mb-0.5">
                {currentTrack?.title || "Select a Song"}
              </span>
              <div className="relative overflow-hidden w-full h-4 flex items-center">
                <div className={`${(currentTrack?.artists?.length > 1 || (currentTrack?.artist?.length > 15)) ? 'animate-marquee' : 'truncate'} text-[10px] font-black text-[#666] tracking-tighter leading-none`}>
                  <span className="pr-8">
                    {Array.isArray(currentTrack?.artists)
                      ? currentTrack.artists.map(a => a.name).join(', ')
                      : (currentTrack?.artist || 'VibAura Artist')}
                  </span>
                  {(currentTrack?.artists?.length > 1 || (currentTrack?.artist?.length > 15)) && (
                    <span className="pr-8">
                      {Array.isArray(currentTrack?.artists)
                        ? currentTrack.artists.map(a => a.name).join(', ')
                        : (currentTrack?.artist || 'VibAura Artist')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <LikeButton
              isLiked={isLiked}
              onClick={handleLikeClick}
              className="scale-90 hover:scale-110 transition-transform mr-1 ml-2"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrackInfoPod;
