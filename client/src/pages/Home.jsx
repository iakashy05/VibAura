import React from 'react';
import Card from '../components/music/card';

const Home = ({ onNavigate }) => {
  const albums = {
    featured: [
      { 
        id: 1, 
        title: "Midnight City", 
        subtitle: "M83", 
        image: "https://placehold.co/400x400/FF0080/FFFFFF?text=M83",
        songs: [
          { id: 101, title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", image: "https://placehold.co/100x100/FF0080/FFFFFF?text=M" },
          { id: 102, title: "Reunion", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "3:55", image: "https://placehold.co/100x100/FF0080/FFFFFF?text=M" },
          { id: 103, title: "Wait", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "5:42", image: "https://placehold.co/100x100/FF0080/FFFFFF?text=M" },
        ]
      },
      { 
        id: 2, 
        title: "After Hours", 
        subtitle: "The Weeknd", 
        image: "https://placehold.co/400x400/63b3ed/FFFFFF?text=Artist",
        songs: [
          { id: 201, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", image: "https://placehold.co/100x100/63b3ed/FFFFFF?text=W" },
          { id: 202, title: "Save Your Tears", artist: "The Weeknd", album: "After Hours", duration: "3:35", image: "https://placehold.co/100x100/63b3ed/FFFFFF?text=W" },
          { id: 203, title: "Heartless", artist: "The Weeknd", album: "After Hours", duration: "3:18", image: "https://placehold.co/100x100/63b3ed/FFFFFF?text=W" },
        ]
      },
      { id: 3, title: "Future Nostalgia", subtitle: "Dua Lipa", image: "https://placehold.co/400x400/d53f8c/FFFFFF?text=Album" },
      { id: 6, title: "Starboy", subtitle: "The Weeknd", image: "https://placehold.co/400x400/FF0000/FFFFFF?text=Starboy" },
      { id: 7, title: "Un Verano Sin Ti", subtitle: "Bad Bunny", image: "https://placehold.co/400x400/FFA500/FFFFFF?text=UVST" },
      { id: 8, title: "Harry's House", subtitle: "Harry Styles", image: "https://placehold.co/400x400/38a169/FFFFFF?text=Harry" },
    ],
    newReleases: [
      { id: 10, title: "Guts", subtitle: "Olivia Rodrigo", image: "https://placehold.co/400x400/805ad5/FFFFFF?text=Guts" },
      { id: 11, title: "Utopia", subtitle: "Travis Scott", image: "https://placehold.co/400x400/1a202c/FFFFFF?text=Utopia" },
      { id: 12, title: "Midnights", subtitle: "Taylor Swift", image: "https://placehold.co/400x400/2c5282/FFFFFF?text=TS" },
      { id: 13, title: "SOS", subtitle: "SZA", image: "https://placehold.co/400x400/2b6cb0/FFFFFF?text=SOS" },
      { id: 14, title: "Endless Summer", subtitle: "Miley Cyrus", image: "https://placehold.co/400x400/e53e3e/FFFFFF?text=Miley" },
      { id: 15, title: "Renaissance", subtitle: "Beyoncé", image: "https://placehold.co/400x400/ecc94b/FFFFFF?text=Bey" },
    ]
  };

  const artists = [
    { 
      id: 4, 
      title: "Taylor Swift", 
      subtitle: "Artist", 
      image: "https://placehold.co/400x400/171923/FFFFFF?text=TS",
      songCount: 154,
      songs: [
        { id: 41, title: "Cruel Summer", artist: "Taylor Swift", album: "Lover", duration: "2:58", image: "https://placehold.co/100x100/FF0080/FFFFFF?text=Lover" },
        { id: 42, title: "Anti-Hero", artist: "Taylor Swift", album: "Midnights", duration: "3:20", image: "https://placehold.co/100x100/2c5282/FFFFFF?text=MD" },
        { id: 43, title: "Blank Space", artist: "Taylor Swift", album: "1989", duration: "3:51", image: "https://placehold.co/100x100/63b3ed/FFFFFF?text=1989" },
        { id: 44, title: "Cardigan", artist: "Taylor Swift", album: "Folklore", duration: "3:59", image: "https://placehold.co/100x100/2d3748/FFFFFF?text=FL" },
        { id: 45, title: "Shake It Off", artist: "Taylor Swift", album: "1989", duration: "3:39", image: "https://placehold.co/100x100/63b3ed/FFFFFF?text=1989" },
      ]
    },
    { 
      id: 5, 
      title: "Drake", 
      subtitle: "Artist", 
      image: "https://placehold.co/400x400/2d3748/FFFFFF?text=Drake",
      songCount: 210,
      songs: [
        { id: 51, title: "God's Plan", artist: "Drake", album: "Scorpion", duration: "3:18", image: "https://placehold.co/100x100/000000/FFFFFF?text=DR" },
        { id: 52, title: "One Dance", artist: "Drake", album: "Views", duration: "2:53", image: "https://placehold.co/100x100/000000/FFFFFF?text=DR" },
        { id: 53, title: "Hotline Bling", artist: "Drake", album: "Views", duration: "4:27", image: "https://placehold.co/100x100/000000/FFFFFF?text=DR" },
      ]
    },
    { 
      id: 9, 
      title: "Dua Lipa", 
      subtitle: "Artist", 
      image: "https://placehold.co/400x400/d53f8c/FFFFFF?text=DL",
      songCount: 42,
      songs: [
        { id: 91, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23", image: "https://placehold.co/100x100/d53f8c/FFFFFF?text=FN" },
        { id: 92, title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:03", image: "https://placehold.co/100x100/d53f8c/FFFFFF?text=FN" },
      ]
    },
    { id: 16, title: "The Weeknd", subtitle: "Artist", image: "https://placehold.co/400x400/000000/FFFFFF?text=TW", songCount: 120 },
    { id: 17, title: "Post Malone", subtitle: "Artist", image: "https://placehold.co/400x400/cbd5e0/FFFFFF?text=Post", songCount: 85 },
    { id: 18, title: "Ed Sheeran", subtitle: "Artist", image: "https://placehold.co/400x400/3182ce/FFFFFF?text=Ed", songCount: 145 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-14 pb-12">
      {/* Section 1: Featured */}
      <MusicSection title="Featured Albums" items={albums.featured} onNavigate={onNavigate} />

      {/* Section 2: Artists */}
      <MusicSection title="Your Favorite Artists" items={artists} isArtist onNavigate={onNavigate} />

      {/* Section 3: New Releases */}
      <MusicSection title="New Releases" items={albums.newReleases} onNavigate={onNavigate} />

      {/* Section 4: Extra Mock Data */}
      <MusicSection title="Based on your Vibe" items={albums.featured} onNavigate={onNavigate} />
      <MusicSection title="Today's Biggest Hits" items={albums.newReleases} onNavigate={onNavigate} />
    </div>
  );
};

// Internal helper for sections
const MusicSection = ({ title, items, isArtist = false, onNavigate }) => (
  <section>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter">{title}</h2>
      <button className="text-vibaura-pink font-semibold hover:underline text-sm">Show all</button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
      {items.map(item => (
        <Card 
          key={item.id} 
          {...item} 
          rounded={isArtist ? "full" : "lg"} 
          onClick={() => onNavigate(isArtist ? 'artist' : 'playlist', item)}
        />
      ))}
    </div>
  </section>
);

export default Home;
