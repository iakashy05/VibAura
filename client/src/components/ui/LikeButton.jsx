import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const LikeButton = ({ isLiked, onClick, className = "" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    // Only animate when liking (moving from unliked to liked)
    if (!isLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
    onClick(e);
  };

  // 8 particles in a circle
  const particles = [
    { x: '0px', y: '-30px', color: '#6367FF' },   // Top
    { x: '22px', y: '-22px', color: '#9333EA' },  // Top-Right
    { x: '30px', y: '0px', color: '#EC4899' },    // Right
    { x: '22px', y: '22px', color: '#6367FF' },   // Bottom-Right
    { x: '0px', y: '30px', color: '#9333EA' },    // Bottom
    { x: '-22px', y: '22px', color: '#EC4899' },  // Bottom-Left
    { x: '-30px', y: '0px', color: '#6367FF' },   // Left
    { x: '-22px', y: '-22px', color: '#9333EA' }, // Top-Left
  ];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Particles Burst - Only on Liking */}
      {isAnimating && particles.map((p, i) => (
        <div 
          key={i}
          className="particle animate-particle"
          style={{ 
            backgroundColor: p.color,
            '--tw-translate-x': p.x,
            '--tw-translate-y': p.y,
            animationDelay: `${i * 0.02}s`
          }}
        />
      ))}

      <button 
        onClick={handleClick}
        className={`relative z-10 transition-all p-2 hover:scale-105 active:scale-95
          ${isLiked ? 'text-vibaura-primary' : 'text-[#777] hover:text-vibaura-primary'}
          ${isAnimating ? 'animate-heart-sparkle' : ''}`}
      >
        <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} size="lg" />
      </button>
    </div>
  );
};

export default LikeButton;
