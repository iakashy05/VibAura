import React from 'react';
import { Reorder } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGripVertical, faMusic } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '../../store/playerStore';

const QueuePanel = ({ isOpen, onClose, queueRef }) => {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const userQueue = usePlayerStore(state => state.userQueue);
  const queue = usePlayerStore(state => state.queue);
  const currentIndex = usePlayerStore(state => state.currentIndex);
  const reorderQueue = usePlayerStore(state => state.reorderQueue);
  const removeFromQueue = usePlayerStore(state => state.removeFromQueue);
  const playFromUserQueue = usePlayerStore(state => state.playFromUserQueue);
  const playFromContextQueue = usePlayerStore(state => state.playFromContextQueue);

  if (!isOpen) return null;

  const nextFromContext = queue.slice(currentIndex + 1);

  return (
    <>
      {/* Mobile Backdrop Dim Overlay */}
      <div 
        onClick={onClose}
        className="block md:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-all duration-300 pointer-events-auto"
      />

      <div 
        ref={queueRef}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 w-full h-[50vh] max-h-[50vh] rounded-t-[32px] border-t border-black/5 bg-white/95 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] md:absolute md:bottom-[90px] md:right-0 md:left-auto md:w-[320px] md:h-auto md:max-h-[60vh] md:rounded-[28px] md:border md:border-white/50 md:bg-white/80 md:backdrop-blur-xl md:shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col pointer-events-auto z-50 overflow-hidden transition-all duration-500 ease-out overscroll-behavior-none"
      >
      <div className="px-5 py-4 border-b border-black/5 flex justify-between items-center bg-white/50">
        <h3 className="font-black text-sm tracking-widest text-[#1A1A1A]">Queue</h3>
        <button 
          onClick={onClose}
          className="text-[#999] hover:text-[#1A1A1A] transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5"
        >
          <FontAwesomeIcon icon={faTimes} size="sm" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {/* Now Playing */}
        {currentTrack && (
          <div className="mb-4">
            <h4 className="px-3 text-[10px] font-black text-vibaura-primary uppercase tracking-widest mb-2">Now Playing</h4>
            <div className="px-3 py-2 flex items-center gap-3 bg-vibaura-primary/5 rounded-xl border border-vibaura-primary/10">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <img src={currentTrack.image || currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-[13px] text-vibaura-primary truncate leading-tight">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-[#666] font-medium truncate tracking-tighter">
                  {Array.isArray(currentTrack.artists) 
                    ? currentTrack.artists.map(a => a.name).join(', ') 
                    : (currentTrack.artist || 'VibAura Artist')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Queue (Draggable) */}
        {userQueue.length > 0 && (
          <div className="mb-4">
            <h4 className="px-3 text-[10px] font-black text-[#888] uppercase tracking-widest mb-2">Next in Queue</h4>
            <Reorder.Group 
              axis="y" 
              values={userQueue} 
              onReorder={reorderQueue}
              className="space-y-1"
            >
              {userQueue.map((track, index) => (
                <Reorder.Item 
                  key={`${track.id || track._id || index}-${index}`} 
                  value={track}
                  onClick={() => playFromUserQueue(index)}
                  className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <div 
                    className="text-[#CCC] group-hover:text-[#888] transition-colors cursor-grab active:cursor-grabbing px-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FontAwesomeIcon icon={faGripVertical} size="xs" />
                  </div>
                  <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={track.image || track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-[12px] text-[#1A1A1A] truncate leading-tight">
                      {track.title}
                    </span>
                    <span className="text-[9px] text-[#888] font-medium truncate tracking-tighter">
                      {Array.isArray(track.artists) 
                        ? track.artists.map(a => a.name).join(', ') 
                        : (track.artist || 'VibAura Artist')}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-[#999] hover:text-red-500 rounded-full hover:bg-white"
                  >
                    <FontAwesomeIcon icon={faTimes} size="sm" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {/* Context Queue */}
        {nextFromContext.length > 0 ? (
          <div>
            <h4 className="px-3 text-[10px] font-black text-[#888] uppercase tracking-widest mb-2">Next from Playlist</h4>
            <div className="space-y-1">
              {nextFromContext.map((track, index) => (
                <div 
                  key={`${track.id || track._id || index}-${index}`} 
                  onClick={() => playFromContextQueue(currentIndex + 1 + index)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 shadow-sm bg-black/5 flex items-center justify-center text-[#999]">
                    {track.image || track.albumArt ? (
                      <img src={track.image || track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <FontAwesomeIcon icon={faMusic} size="xs" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-[12px] text-[#1A1A1A] truncate leading-tight">
                      {track.title}
                    </span>
                    <span className="text-[9px] text-[#888] font-medium truncate tracking-tighter">
                      {Array.isArray(track.artists) 
                        ? track.artists.map(a => a.name).join(', ') 
                        : (track.artist || 'VibAura Artist')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !currentTrack && userQueue.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <FontAwesomeIcon icon={faMusic} className="text-3xl mb-3" />
              <p className="text-[11px] font-black uppercase tracking-widest text-center">Queue is empty</p>
            </div>
          )
        )}
      </div>
    </div>
    </>
  );
};

export default QueuePanel;
