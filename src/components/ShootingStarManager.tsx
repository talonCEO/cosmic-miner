
import React, { useEffect, useState } from 'react';
import ShootingStar from './ShootingStar';

const ShootingStarManager: React.FC = () => {
  const [stars, setStars] = useState<{id: number, x: number}[]>([]);
  const [nextId, setNextId] = useState(0);
  
  // Spawn new stars at random intervals
  useEffect(() => {
    const spawnStar = () => {
      const windowWidth = window.innerWidth;
      // Random position along the top of the screen
      const x = Math.random() * windowWidth;
      
      // Add a new star
      setStars(prev => [...prev, { id: nextId, x }]);
      setNextId(prev => prev + 1);
      
      // Schedule next spawn (between 3-15 seconds)
      const nextSpawnTime = 3000 + Math.random() * 12000;
      setTimeout(spawnStar, nextSpawnTime);
    };
    
    // Start the first spawn
    const initialDelay = 1000 + Math.random() * 2000;
    const timeout = setTimeout(spawnStar, initialDelay);
    
    return () => clearTimeout(timeout);
  }, [nextId]);
  
  // Remove stars after 30 seconds
  useEffect(() => {
    if (stars.length === 0) return;
    
    const timer = setTimeout(() => {
      // Remove the oldest star
      setStars(prev => prev.slice(1));
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [stars]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {stars.map(star => (
        <ShootingStar 
          key={star.id}
          x={star.x}
        />
      ))}
    </div>
  );
};

export default ShootingStarManager;
