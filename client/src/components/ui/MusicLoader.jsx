import React from 'react';

/**
 * MusicLoader Component
 * A premium, GPU-accelerated equalizer animation used for page transitions, logins, and initial load.
 */
const MusicLoader = ({ fullScreen = false }) => {
  const bars = [
    { color: "bg-vibaura-primary", animClass: "animate-wave-1" },
    { color: "bg-indigo-400", animClass: "animate-wave-2" },
    { color: "bg-purple-500", animClass: "animate-wave-3" },
    { color: "bg-pink-500", animClass: "animate-wave-4" },
    { color: "bg-rose-400", animClass: "animate-wave-5" },
  ];

  const content = (
    <div className="flex items-end gap-1.5 h-16 w-28 px-4 justify-center relative select-none pointer-events-none">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`w-2.5 h-full rounded-full ${bar.color} opacity-90 shadow-[0_4px_12px_rgba(99,103,255,0.15)] origin-bottom ${bar.animClass}`}
          style={{ willChange: 'transform' }}
        />
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave-smooth-1 {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(0.95); }
        }
        @keyframes wave-smooth-2 {
          0%, 100% { transform: scaleY(0.45); }
          50% { transform: scaleY(0.8); }
        }
        @keyframes wave-smooth-3 {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1.0); }
        }
        @keyframes wave-smooth-4 {
          0%, 100% { transform: scaleY(0.40); }
          50% { transform: scaleY(0.75); }
        }
        @keyframes wave-smooth-5 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(0.9); }
        }

        .animate-wave-1 {
          animation: wave-smooth-1 1.0s ease-in-out infinite;
        }
        .animate-wave-2 {
          animation: wave-smooth-2 1.2s ease-in-out infinite;
        }
        .animate-wave-3 {
          animation: wave-smooth-3 0.9s ease-in-out infinite;
        }
        .animate-wave-4 {
          animation: wave-smooth-4 1.1s ease-in-out infinite;
        }
        .animate-wave-5 {
          animation: wave-smooth-5 1.3s ease-in-out infinite;
        }
      ` }} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F9F5F6]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] items-center justify-center w-full select-none pointer-events-none z-30">
      {content}
    </div>
  );
};

export default MusicLoader;
