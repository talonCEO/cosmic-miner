
import React, { useEffect, useRef, useState } from 'react';

interface ShootingStarProps {
  onComplete: () => void;
  id: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ onComplete, id }) => {
  const starRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  
  // Generate random starting position and direction on mount
  useEffect(() => {
    // Determine which edge to start from (top, right, left, bottom)
    const startEdge = Math.floor(Math.random() * 4);
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    
    // Position off-screen based on the randomly chosen edge
    switch (startEdge) {
      case 0: // top
        x = Math.random() * windowWidth;
        y = -50;
        dx = Math.random() * 2 - 1;
        dy = Math.random() * 2 + 1;
        break;
      case 1: // right
        x = windowWidth + 50;
        y = Math.random() * windowHeight;
        dx = -(Math.random() * 2 + 1);
        dy = Math.random() * 2 - 1;
        break;
      case 2: // bottom
        x = Math.random() * windowWidth;
        y = windowHeight + 50;
        dx = Math.random() * 2 - 1;
        dy = -(Math.random() * 2 + 1);
        break;
      case 3: // left
        x = -50;
        y = Math.random() * windowHeight;
        dx = Math.random() * 2 + 1;
        dy = Math.random() * 2 - 1;
        break;
    }
    
    // Normalize direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    // Apply random velocity reduction (20-33% of current value)
    const velocityFactor = 0.2 + (Math.random() * 0.13); // Between 20% and 33%
    dx = (dx / magnitude) * velocityFactor * 5; // Scale speed
    dy = (dy / magnitude) * velocityFactor * 5;
    
    setPosition({ x, y });
    setDirection({ x: dx, y: dy });
    
    // Remove star after 10 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  // Move the star according to its direction
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => ({
        x: prev.x + direction.x,
        y: prev.y + direction.y
      }));
    }, 16); // ~60fps
    
    return () => clearInterval(moveInterval);
  }, [direction]);
  
  return (
    <div 
      ref={starRef}
      className="absolute z-0"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.05s linear',
      }}
    >
      {/* Main star body */}
      <div 
        className="w-4 h-4 rounded-full bg-white"
        style={{
          boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.7)',
        }}
      />
      
      {/* Particle trail */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            left: -4 - (i * 4),
            top: 1,
            opacity: 0.8 - (i * 0.1),
            transform: `scale(${1 - (i * 0.1)})`,
          }}
        />
      ))}
    </div>
  );
};

export default ShootingStar;
