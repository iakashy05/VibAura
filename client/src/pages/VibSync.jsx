import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPodcast, faPlay, faStop, faSignOutAlt, faCrown, faUserCog, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import useVibSyncStore from '../store/useVibSyncStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { useVibSyncSocket } from '../hooks/useVibSyncSocket';

const VibSync = () => {
  const { isSubscribed, user } = useAuthStore();
  const { roomId, roomCode, participants, myRole, isConnected, connectionError } = useVibSyncStore();
  const { createRoom, joinRoom, leaveRoom, grantControl } = useVibSyncSocket();
  const { showToast } = useUIStore();

  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const unlockAudio = () => {
    const audioEl = document.getElementById('vibaura-audio-player');
    if (audioEl) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioEl.pause();
        }).catch(() => {});
      }
    }
  };

  const handleCreateRoom = () => {
    unlockAudio();
    setIsLoading(true);
    setErrorMsg('');
    createRoom(
      () => { 
        setIsLoading(false); 
        showToast('VibSync Session Started', 'success');
      },
      (err) => { 
        setErrorMsg(err); 
        setIsLoading(false); 
        showToast(err, 'error');
      }
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
      () => { 
        setIsLoading(false); 
        setJoinCode(''); 
        showToast('Joined Session Successfully', 'success');
      },
      (err) => { 
        setErrorMsg(err); 
        setIsLoading(false); 
        showToast(err, 'error');
      }
    );
  };

  const handleToggleControl = (targetUserId, currentRole) => {
    if (myRole !== 'HOST') return;
    const isController = currentRole !== 'CONTROLLER';
    grantControl(targetUserId, isController);
    showToast(isController ? 'Granted control' : 'Revoked control', 'info');
  };

  return (
    <div className="max-w-md mx-auto px-4 md:px-6 py-4 md:py-8 min-h-full flex flex-col justify-center animate-page-in">
      {/* 1. Header Hero Card */}
      <div className="p-4 md:p-6 bg-gradient-to-tr from-vibaura-primary to-indigo-600 rounded-3xl text-white shadow-xl flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
          <FontAwesomeIcon icon={faPodcast} className="text-2xl" />
        </div>
        <div>
          <h2 className="font-black tracking-tighter text-2xl leading-none">VibSync</h2>
          <p className="text-xs font-medium opacity-85 mt-1.5">Listen together in real-time</p>
        </div>
      </div>

      {/* 2. Main Action Card */}
      <div className="p-4 md:p-6 bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg flex-1 flex flex-col justify-between min-h-[340px] md:min-h-[380px]">
        {(errorMsg || connectionError) && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-[11px] font-black rounded-2xl text-center border border-red-100 uppercase tracking-wider">
            {errorMsg || connectionError}
          </div>
        )}

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-text-muted text-sm font-bold gap-3">
            <p>Please log in to initiate synchronized live playback.</p>
          </div>
        ) : !isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-text-muted text-sm font-black tracking-widest uppercase animate-pulse">
            {connectionError ? 'Retrying connection...' : 'Connecting to VibSync...'}
          </div>
        ) : !roomId ? (
          // --- HOST & JOIN OPTIONS ---
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {isSubscribed ? (
                <button 
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-vibaura-view-bg border border-black/5 hover:border-vibaura-primary transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-vibaura-primary text-white flex items-center justify-center shadow-md">
                      <FontAwesomeIcon icon={faPlay} className="text-sm" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Start a Session</p>
                      <p className="text-[10px] text-text-muted font-bold">You will be the Host</p>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faChevronRight} className="text-text-muted/40 group-hover:text-vibaura-primary transition-colors" />
                </button>
              ) : (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex gap-3">
                  <FontAwesomeIcon icon={faCrown} className="text-[#F5B041] mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-800">Pro Feature</p>
                    <p className="text-[10px] text-amber-700/80 font-bold mt-1 leading-relaxed">Upgrade to Pro to host your own VibSync sessions.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-dashed border-vibaura-border/40"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-black text-text-muted/60 uppercase tracking-widest">Or Join</span>
              <div className="flex-grow border-t border-dashed border-vibaura-border/40"></div>
            </div>

            <div className="space-y-3">
              <Input 
                placeholder="Enter 6-digit Code" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                inputClassName={`!py-3.5 !text-center font-mono !uppercase !rounded-2xl transition-all duration-250 ${
                  joinCode 
                    ? '!text-lg !tracking-[0.2em]' 
                    : '!text-xs !tracking-normal'
                }`}
              />
              <Button 
                onClick={handleJoinRoom} 
                disabled={isLoading || joinCode.length !== 6}
                className="w-full !rounded-2xl !py-3.5 shadow-lg !h-auto text-sm font-black tracking-widest uppercase"
              >
                Join
              </Button>
            </div>
          </div>
        ) : (
          // --- ACTIVE ROOM DETAIL VIEW ---
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Room Code Card */}
              <div className="text-center bg-vibaura-view-bg p-4 rounded-2xl border border-black/5 relative shadow-inner">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">Room Code</p>
                <p className="text-3xl font-mono font-black tracking-[0.4em] text-vibaura-primary pl-2">{roomCode}</p>
              </div>
              
              {/* Participant List */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Participants ({participants.length})</span>
                </div>
                <div className="overflow-y-auto space-y-2 max-h-48 pr-1 no-scrollbar">
                  {participants.map(p => (
                    <div key={p.userId} className="flex items-center justify-between p-3 rounded-2xl bg-vibaura-view-bg border border-black/[0.02]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-md">
                          {p.userId === user?._id ? 'Me' : p.name ? p.name.substring(0, 2).toUpperCase() : 'AU'}
                        </div>
                        <span className="text-xs font-black text-[#1A1A1A] truncate">
                          {p.userId === user?._id ? 'You (Me)' : p.name || 'Anonymous Aura'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm
                          ${p.role === 'HOST' ? 'bg-[#FFFBF0] text-[#F5B041] border-[#FFE082]' : 
                            p.role === 'CONTROLLER' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 
                            'bg-gray-50 text-gray-500 border-gray-200'}`}
                        >
                          {p.role}
                        </span>
                        
                        {myRole === 'HOST' && p.userId !== user?._id && (
                          <button 
                            onClick={() => handleToggleControl(p.userId, p.role)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-vibaura-primary hover:bg-vibaura-primary/5 transition-all"
                            title={p.role === 'CONTROLLER' ? 'Revoke Controller' : 'Grant Controller'}
                          >
                            <FontAwesomeIcon icon={faUserCog} className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leave Room Button */}
            <div className="pt-4 border-t border-black/5 mt-4">
              <button 
                onClick={leaveRoom}
                className="w-full py-3.5 rounded-2xl border border-red-100 text-red-500 text-xs font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FontAwesomeIcon icon={myRole === 'HOST' ? faStop : faSignOutAlt} />
                <span>{myRole === 'HOST' ? 'End VibSync Session' : 'Leave Session'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibSync;
