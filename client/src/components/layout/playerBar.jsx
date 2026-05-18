import React from 'react';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import QueuePanel from './QueuePanel';
import TrackInfoPod from '../player/TrackInfoPod';
import PlaybackControlsPod from '../player/PlaybackControlsPod';
import VolumeToolsPod from '../player/VolumeToolsPod';

const PlayerBar = ({ onNavigate }) => {
  const player = useAudioPlayer(onNavigate);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        left: player.isCollapsed ? 88 : 360,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="fixed bottom-8 right-0 z-50 flex justify-center pointer-events-none select-none transition-all duration-500"
    >
      {/* Native HTML5 Audio Element */}
      <audio
        id="vibaura-audio-player"
        ref={player.audioRef}
        src={player.currentTrack?.url}
        crossOrigin="anonymous"
        onTimeUpdate={player.handleTimeUpdate}
        onLoadedMetadata={player.handleLoadedMetadata}
        onEnded={player.handleEnded}
      />

      <div className="flex items-center justify-between w-full max-w-7xl px-8 pointer-events-none relative gap-4">
        {/* 1. Song Info Island (Left Pod) */}
        <TrackInfoPod
          currentTrack={player.currentTrack}
          isLiked={player.isLiked}
          isCollapsed={player.isCollapsed}
          handleLikeClick={player.handleLikeClick}
          handleFullscreenClick={player.handleFullscreenClick}
        />

        {/* 2. Main Playback Controls Island (Center Pod) */}
        <PlaybackControlsPod
          isShuffle={player.isShuffle}
          toggleShuffle={player.toggleShuffle}
          prevTrack={player.prevTrack}
          togglePlay={player.togglePlay}
          isPlaying={player.isPlaying}
          nextTrack={player.nextTrack}
          toggleRepeat={player.toggleRepeat}
          repeatMode={player.repeatMode}
          currentTime={player.currentTime}
          duration={player.duration}
          progress={player.progress}
          setIsDragging={player.setIsDragging}
          handleSeek={player.handleSeek}
          handleSeekEnd={player.handleSeekEnd}
          formatTime={player.formatTime}
          isVibSyncActive={player.isVibSyncActive}
          hasControl={player.hasControl}
        />

        {/* 3. Volume & Tools Island (Right Pod) */}
        <VolumeToolsPod
          isCollapsed={player.isCollapsed}
          queueButtonRef={player.queueButtonRef}
          isQueueOpen={player.isQueueOpen}
          setIsQueueOpen={player.setIsQueueOpen}
          isSubscribed={player.isSubscribed}
          handleFullscreenClick={player.handleFullscreenClick}
          toggleMute={player.toggleMute}
          getVolumeIcon={player.getVolumeIcon}
          volume={player.volume}
          setVolume={player.setVolume}
        />

        {/* Queue Panel Overlay */}
        <QueuePanel 
          isOpen={player.isQueueOpen} 
          onClose={() => player.setIsQueueOpen(false)} 
          queueRef={player.queueRef} 
        />
      </div>
    </motion.div>
  );
};

export default PlayerBar;
