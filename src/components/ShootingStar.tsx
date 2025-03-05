
import React, { useEffect, useState, useRef } from 'react';

interface ShootingStarProps {
  x: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ x }) => {
  const [position, setPosition] = useState({ x, y: -10 });
  const rafRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  // Random size between 0.4% and 1.1% of current size (which is 3px)
  const size = useRef(0.03 * (Math.random() * 0.7 + 0.4)).current; // 0.012px to 0.033px
  
  // Use requestAnimationFrame for smoother animation
  useEffect(() => {
    const updatePosition = (timestamp: number) => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTimeRef.current;
      
      // Ensure consistent movement speed regardless of frame rate
      if (deltaTime > 0) {
        const pixelsPerMillisecond = 0.5 / 16; // Original speed: 0.5px per 16ms
        const deltaY = pixelsPerMillisecond * deltaTime;
        
        setPosition(prev => ({
          x: prev.x,
          y: prev.y + deltaY
        }));
        
        lastUpdateTimeRef.current = now;
      }
      
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    
    rafRef.current = requestAnimationFrame(updatePosition);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      className="absolute z-10"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Main star body with adjusted size */}
      <div 
        className="rounded-full bg-white"
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          boxShadow: `0 0 ${size * 2.5}px ${size * 0.5}px rgba(255, 255, 255, 0.7)`,
        }}
      />
    </div>
  );
};

export default ShootingStar;
