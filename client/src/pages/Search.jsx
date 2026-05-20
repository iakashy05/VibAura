import React, { useEffect, useState } from 'react';
import MusicSection from '../components/music/MusicSection';
import TrackList from '../components/music/TrackList';
import Card from '../components/music/card';
import { search } from '../services/discoveryService';
import { usePlayerStore } from '../store/playerStore';
import MusicLoader from '../components/ui/MusicLoader';

const Search = ({ query, setSearchQuery, onNavigate }) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const setTrack = usePlayerStore(state => state.setTrack);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setDebouncedQuery('');
      setLoading(false);
      setResults([]);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim() === '') {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      try {
        const data = await search(debouncedQuery);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleAction = (type, item, allItems) => {
    if (type === 'song') {
      setTrack(item, allItems);
    } else {
      onNavigate(type, item);
    }
  };

  // Split results into Top Result and Others
  const topResult = results.find(r => r.type === 'top')?.items[0];
  const songSection = results.find(r => r.type === 'song');
  const otherSections = results.filter(r => r.type !== 'top' && r.type !== 'song');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-10 pb-12">
      
      {/* Sub-container for search conditions */}
      <div className="space-y-8 md:space-y-16">
        {!query || query.trim() === '' ? (
          <div className="flex h-96 flex-col items-center justify-center text-text-muted space-y-4">
            <div className="w-16 h-16 rounded-full bg-vibaura-surface flex items-center justify-center border border-white/5 shadow-sm">
              <svg className="w-6 h-6 opacity-35 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-[11px] font-black tracking-widest uppercase opacity-40">Start typing to search...</span>
          </div>
        ) : loading && results.length === 0 ? (
          <MusicLoader text="Searching Aura..." />
        ) : results.length === 0 && !loading ? (
          <div className="flex h-96 flex-col items-center justify-center text-text-muted">
             <span className="text-xs opacity-40 font-black uppercase tracking-wider">No results found for "{query}"</span>
          </div>
        ) : (
          <div className="space-y-8 animate-page-in">
            {/* 1. Top Section: Top Result & Top Songs */}
            {topResult && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Top Result Card */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-3">
                  <h2 className="text-sm font-black text-text-muted uppercase tracking-wider px-1">Top Result</h2>
                  <div className="bg-white p-5 rounded-[28px] border border-black/[0.03] group relative overflow-hidden transition-all hover:bg-black/[0.01]">
                    <div className={`w-20 h-20 mb-4 shadow-md overflow-hidden ${topResult.resultType === 'artist' ? 'rounded-full' : 'rounded-2xl'}`}>
                       <img src={topResult.image} alt={topResult.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary mb-1 truncate tracking-tight">{topResult.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-vibaura-view-bg rounded-full text-[8px] font-black uppercase tracking-wider text-[#999]">
                        {topResult.resultType}
                      </span>
                      <span className="text-[11px] font-bold text-[#888] truncate">{topResult.subtitle}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleAction(topResult.resultType, topResult, results.find(r => r.type === topResult.resultType)?.items || [topResult])}
                      className="absolute bottom-5 right-5 w-11 h-11 bg-vibaura-primary rounded-full flex items-center justify-center text-white shadow-md opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                </div>

                {/* Top Songs */}
                {songSection && (
                  <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                    <h2 className="text-sm font-black text-text-muted uppercase tracking-wider px-1">Songs</h2>
                    <TrackList tracks={songSection.items.slice(0, 4)} />
                  </div>
                )}
              </div>
            )}

            {/* 2. Full Songs List (if no top result) */}
            {!topResult && songSection && (
              <div className="space-y-3">
                <h2 className="text-sm font-black text-text-muted uppercase tracking-wider px-1">Songs</h2>
                <TrackList tracks={songSection.items} />
              </div>
            )}
            
            {/* 3. Artists & Playlists (Swiper format) */}
            {otherSections.map(section => (
              <div key={section.title} className="space-y-2">
                <MusicSection 
                  title={section.title}
                  items={section.items}
                  type={section.type}
                  onCardClick={(item) => handleAction(section.type, item, section.items)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
