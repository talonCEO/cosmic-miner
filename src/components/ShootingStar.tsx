
import React, { useEffect, useState } from 'react';

interface ShootingStarProps {
  x: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ x }) => {
  const [position, setPosition] = useState({ x, y: -10 });
  
  // Move the star downward at a constant slow speed
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => ({
        x: prev.x,
        y: prev.y + 0.5 // Slow downward movement
      }));
    }, 16); // ~60fps
    
    return () => clearInterval(moveInterval);
  }, []);
  
  return (
    <div 
      className="absolute z-10"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.05s linear',
      }}
    >
      {/* Main star body */}
      <div 
        className="w-3 h-3 rounded-full bg-white"
        style={{
          boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.7)',
        }}
      />
    </div>
  );
};

export default ShootingStar;
