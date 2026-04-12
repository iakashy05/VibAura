import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faBookOpen 
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/button';

const Sidebar = ({ onNavigate, currentPage }) => {
  const playlists = [
    { id: 1, name: 'My Favorites', count: 12 },
    { id: 2, name: 'Summer Vibes 2024', count: 45 },
    { id: 3, name: 'Chill Lofi Beats', count: 120 },
  ];

  return (
    <aside className="w-72 flex flex-col h-full bg-vibaura-surface p-6">
      


      {/* Library Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <FontAwesomeIcon icon={faBookOpen} />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Your Library</h3>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-vibaura-pink-light hover:text-vibaura-pink">
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </Button>
        </div>

        {/* Playlist List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => onNavigate('playlist')}
              className="group flex flex-col px-3 py-2 rounded-xl border border-transparent hover:border-vibaura-border hover:bg-vibaura-bg-pink/50 transition-all cursor-pointer"
            >
              <span className="font-medium text-text-primary group-hover:text-vibaura-pink transition-colors">
                {playlist.name}
              </span>
              <span className="text-xs text-text-muted">
                Playlist • {playlist.count} songs
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};


export default Sidebar;
