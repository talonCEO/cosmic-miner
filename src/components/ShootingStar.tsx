
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
    
    // Apply a consistent speed factor
    const speedFactor = 0.25; // Consistent speed of 25% 
    dx = (dx / magnitude) * speedFactor * 5; // Scale speed
    dy = (dy / magnitude) * speedFactor * 5;
    
    setPosition({ x, y });
    setDirection({ x: dx, y: dy });
  }, [onComplete]);
  
  // Move the star according to its direction and check if it's offscreen
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + direction.x;
        const newY = prev.y + direction.y;
        
        // Check if the star has gone off-screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (
          newX < -100 || 
          newX > windowWidth + 100 || 
          newY < -100 || 
          newY > windowHeight + 100
        ) {
          // Star is off-screen, trigger removal
          clearInterval(moveInterval);
          onComplete();
        }
        
        return { x: newX, y: newY };
      });
    }, 16); // ~60fps
    
    return () => clearInterval(moveInterval);
  }, [direction, onComplete]);
  
  // Calculate the angle based on direction for proper trail alignment
  const trailAngle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
  
  return (
    <div 
      ref={starRef}
      className="absolute z-10" // z-10 to be behind UI elements but in front of canvas
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
      
      {/* Particle trail - aligned opposite to movement direction with 25% increased size */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${trailAngle + 180}deg)`,
          transformOrigin: 'center',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2.5 + 'px', // 25% larger than original 2px
              height: 2.5 + 'px', // 25% larger than original 2px
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              left: 5 + (i * 5), // 25% increase from 4 to 5
              top: 0,
              opacity: 0.8 - (i * 0.1),
              transform: `scale(${1 - (i * 0.1)})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ShootingStar;
