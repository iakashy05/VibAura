import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPodcast, faPlay, faStop, faSignOutAlt, faCrown, faUserCog, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import useVibSyncStore from '../../store/useVibSyncStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Dropdown from '../ui/Dropdown';
import Input from '../ui/input';
import Button from '../ui/button';
import { useVibSyncSocket } from '../../hooks/useVibSyncSocket';

const VibSyncMenu = () => {
  const { isSubscribed, user } = useAuthStore();
  const { roomId, roomCode, participants, myRole, isConnected, connectionError } = useVibSyncStore();
  const { createRoom, joinRoom, leaveRoom, grantControl } = useVibSyncSocket();
  const { activeMenuId, setActiveMenuId } = useUIStore();
  const menuOpen = activeMenuId === 'header-vibsync';
  const setMenuOpen = (open) => setActiveMenuId(open ? 'header-vibsync' : null);

  const menuRef = useRef(null);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unlockAudio = () => {
    const audioEl = document.getElementById('vibaura-audio-player');
    if (audioEl) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioEl.pause();
        }).catch(() => {}); // Ignore play interruptions
      }
    }
  };

  const handleCreateRoom = () => {
    unlockAudio();
    setIsLoading(true);
    setErrorMsg('');
    createRoom(
      () => { setIsLoading(false); },
      (err) => { setErrorMsg(err); setIsLoading(false); }
    );
  };

  const handleJoinRoom = () => {
    unlockAudio();
    if (!joinCode || joinCode.length !== 6) {
      setErrorMsg('Enter a valid 6-character code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    joinRoom(joinCode.toUpperCase(),
      () => { setIsLoading(false); setJoinCode(''); },
      (err) => { setErrorMsg(err); setIsLoading(false); }
    );
  };

  const handleToggleControl = (targetUserId, currentRole) => {
    if (myRole !== 'HOST') return;
    const isController = currentRole !== 'CONTROLLER';
    grantControl(targetUserId, isController);
  };

  return (
    <div className="relative flex items-center" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`h-11 px-4 rounded-[14px] flex items-center justify-center gap-2 transition-all duration-300 font-black text-xs uppercase tracking-wider
          ${roomId 
            ? 'bg-vibaura-primary text-white border-2 border-vibaura-surface' 
            : 'bg-vibaura-view-bg text-text-secondary dark:text-white hover:bg-vibaura-surface/40 hover:text-vibaura-primary hover:border-vibaura-primary/30 border border-black/5 dark:border-white/5 shadow-sm'}`}
      >
        <FontAwesomeIcon icon={faPodcast} className={roomId ? 'animate-pulse' : ''} />
        <span className="hidden md:inline">{roomId ? 'VibSync Live' : 'VibSync'}</span>
      </button>

      <Dropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        positionClass="right-0 top-[calc(100%+12px)]"
        className="w-80 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-tr from-vibaura-primary to-indigo-500 rounded-t-[20px] text-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <FontAwesomeIcon icon={faPodcast} className="text-lg" />
             </div>
             <div>
               <h3 className="font-black tracking-tighter text-lg leading-tight">VibSync</h3>
               <p className="text-[10px] font-bold opacity-80">Listen together in real-time</p>
             </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-vibaura-surface rounded-b-[20px]">
           {(errorMsg || connectionError) && (
             <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/20 text-red-500 text-[10px] font-bold rounded-lg text-center border border-red-100 dark:border-red-900/20">
               {errorMsg || connectionError}
             </div>
           )}

           {!user ? (
             <div className="text-center py-6 text-text-muted text-xs font-bold">
               Please log in to use VibSync.
             </div>
           ) : !isConnected ? (
             <div className="text-center py-6 text-text-muted text-xs font-bold">
               {connectionError ? 'Retrying connection...' : 'Connecting to server...'}
             </div>
           ) : !roomId ? (
             // --- NO ROOM ---
             <div className="space-y-4">
                {isSubscribed ? (
                  <button 
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-vibaura-bg hover:bg-vibaura-primary/5 border border-vibaura-border hover:border-vibaura-primary transition-all group"
                  >
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-vibaura-primary/10 text-vibaura-primary flex items-center justify-center">
                         <FontAwesomeIcon icon={faPlay} className="text-xs" />
                       </div>
                       <div className="text-left">
                         <p className="text-xs font-black text-text-primary">Start a Session</p>
                         <p className="text-[10px] text-text-muted font-bold">You will be the Host</p>
                       </div>
                     </div>
                     <FontAwesomeIcon icon={faChevronRight} className="text-[#CCC] group-hover:text-vibaura-primary" />
                  </button>
                ) : (
                  <div className="p-3 bg-[#FFFBF0] dark:bg-amber-950/10 border border-[#FFE082] dark:border-amber-700/30 rounded-xl flex items-start gap-3">
                      <FontAwesomeIcon icon={faCrown} className="text-[#F5B041] mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-[#5D4037] dark:text-amber-400">Pro Feature</p>
                        <p className="text-[10px] text-[#8D6E63] dark:text-amber-500/80 font-bold mt-1">Upgrade to Pro to host your own VibSync sessions.</p>
                      </div>
                   </div>
                )}

                 <div className="relative flex items-center py-2">
                   <div className="flex-grow border-t border-vibaura-border dark:border-white/5"></div>
                   <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-text-muted uppercase">Or Join</span>
                   <div className="flex-grow border-t border-vibaura-border dark:border-white/5"></div>
                 </div>

                <div className="flex gap-2">
                  <Input 
                     placeholder="Enter 6-digit Code" 
                     value={joinCode}
                     onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                     maxLength={6}
                     inputClassName="!py-3 !text-center !tracking-widest font-mono !uppercase"
                  />
                  <Button 
                    onClick={handleJoinRoom} 
                    disabled={isLoading || joinCode.length !== 6}
                    className="shrink-0 !rounded-xl !h-11"
                  >
                    Join
                  </Button>
                </div>
             </div>
           ) : (
             // --- IN ROOM ---
             <div className="space-y-4">
                 <div className="text-center bg-vibaura-view-bg dark:bg-vibaura-bg-muted/20 p-3 rounded-xl border border-vibaura-border dark:border-white/5 relative group">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Room Code</p>
                   <p className="text-xl font-mono font-black tracking-[0.3em] text-vibaura-primary">{roomCode}</p>
                </div>
                
                <div>
                   <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] font-black uppercase text-text-muted">Participants ({participants.length})</span>
                   </div>
                   <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {participants.map(p => (
                          <div key={p.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                             <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                   {p.userId === user?._id ? 'Me' : p.name ? p.name.substring(0,2) : p.userId.substring(0,2)}
                                </div>
                                <span className="text-xs font-bold text-text-primary truncate">
                                   {p.userId === user?._id ? 'You' : p.name || p.userId}
                                </span>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full
                                   ${p.role === 'HOST' ? 'bg-[#FFFBF0] dark:bg-amber-950/20 text-[#F5B041] border border-[#FFE082] dark:border-amber-700/30' : 
                                     p.role === 'CONTROLLER' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30' : 
                                     'bg-gray-100 dark:bg-white/5 text-text-muted border border-gray-200 dark:border-white/5'}`}
                                >
                                  {p.role}
                               </span>
                               
                               {myRole === 'HOST' && p.userId !== user?._id && (
                                  <button 
                                    onClick={() => handleToggleControl(p.userId, p.role)}
                                    className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-vibaura-primary hover:bg-vibaura-primary/10 transition-colors"
                                    title={p.role === 'CONTROLLER' ? 'Revoke Control' : 'Grant Control'}
                                  >
                                     <FontAwesomeIcon icon={faUserCog} className="text-[10px]" />
                                  </button>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                 <div className="pt-2 border-t border-vibaura-border dark:border-white/5">
                    <button 
                      onClick={leaveRoom}
                      className="w-full py-3 rounded-xl border border-red-100 dark:border-red-900/20 text-red-500 text-xs font-black hover:bg-red-50 dark:hover:bg-red-950/10 transition-all flex items-center justify-center gap-2"
                    >
                     <FontAwesomeIcon icon={myRole === 'HOST' ? faStop : faSignOutAlt} />
                     {myRole === 'HOST' ? 'End Session' : 'Leave Session'}
                   </button>
                </div>
             </div>
           )}
        </div>
      </Dropdown>
    </div>
  );
};

export default VibSyncMenu;
