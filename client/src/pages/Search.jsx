import React, { useEffect, useState } from 'react';
import MusicSection from '../components/music/MusicSection';
import TrackList from '../components/music/TrackList';
import Card from '../components/music/card';
import { search } from '../services/discoveryService';
import { usePlayerStore } from '../store/playerStore';

const Search = ({ query, onNavigate }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const data = await search(query);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleAction = (type, item, allItems) => {
    if (type === 'song') {
      setTrack(item, allItems);
    } else {
      onNavigate(type, item);
    }
  };

  if (!query) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-text-muted space-y-4">
        <div className="w-16 h-16 rounded-full bg-vibaura-surface flex items-center justify-center border border-white/5">
          <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-xl font-medium tracking-widest uppercase opacity-40">Start typing to search...</span>
      </div>
    );
  }

  if (loading && results.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-text-muted animate-pulse">
        <span className="text-xl font-medium tracking-widest uppercase">Searching Aura...</span>
      </div>
    );
  }

  // Split results into Top Result and Others
  const topResult = results.find(r => r.type === 'top')?.items[0];
  const songSection = results.find(r => r.type === 'song');
  const otherSections = results.filter(r => r.type !== 'top' && r.type !== 'song');

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-16 pb-12">
      
      {/* 1. Top Section: Top Result & Top Songs */}
      {topResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Top Result Card */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter px-1">Top Result</h2>
            <div className="bg-vibaura-bg-muted/30 p-6 rounded-[32px] border border-white/5 group relative overflow-hidden transition-all hover:bg-vibaura-bg-muted/50">
              <div className={`w-28 h-28 mb-6 shadow-2xl overflow-hidden ${topResult.resultType === 'artist' ? 'rounded-full' : 'rounded-2xl'}`}>
                 <img src={topResult.image} alt={topResult.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-1 truncate tracking-tight">{topResult.title}</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-vibaura-surface rounded-full text-[10px] font-bold uppercase tracking-widest text-text-muted border border-white/5">
                  {topResult.resultType}
                </span>
                <span className="text-text-muted font-medium truncate">{topResult.subtitle}</span>
              </div>
              
              <button 
                onClick={() => handleAction(topResult.resultType, topResult, results.find(r => r.type === topResult.resultType)?.items || [topResult])}
                className="absolute bottom-6 right-6 w-14 h-14 bg-vibaura-primary rounded-full flex items-center justify-center text-white shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          </div>

          {/* Top Songs (Parallel to Top Result) */}
          {songSection && (
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter px-1">Songs</h2>
              <TrackList tracks={songSection.items.slice(0, 4)} />
            </div>
          )}
        </div>
      )}

      {/* 2. Full Songs List (if no top result or more than 4 songs) */}
      {!topResult && songSection && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter px-1">Songs</h2>
          <TrackList tracks={songSection.items} />
        </div>
      )}
      
      {/* 3. Artists & Playlists (Carousel format) */}
      {otherSections.map(section => (
        <MusicSection 
          key={section.title}
          title={section.title}
          items={section.items}
          type={section.type}
          onCardClick={(item) => handleAction(section.type, item, section.items)}
        />
      ))}

      {results.length === 0 && !loading && (
        <div className="flex h-96 flex-col items-center justify-center text-text-muted">
           <span className="text-lg opacity-40 italic">No results found for "{query}"</span>
        </div>
      )}
    </div>
  );
};

export default Search;
