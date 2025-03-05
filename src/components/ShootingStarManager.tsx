import React, { useEffect, useState, useRef } from 'react';
import ShootingStar from './ShootingStar';

const ShootingStarManager: React.FC = () => {
  const [stars, setStars] = useState<{id: number, x: number, timestamp: number}[]>([]);
  const [nextId, setNextId] = useState(0);
  const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle spawning of new stars
  useEffect(() => {
    const scheduleNextSpawn = () => {
      // Random spawn time between 3-15 seconds
      const nextSpawnTime = 3000 + Math.random() * 12000;
      
      spawnTimeoutRef.current = setTimeout(() => {
        if (stars.length < 20) { // Limit to 20 stars max
          const windowWidth = window.innerWidth;
          // Random position along the top of the screen
          const x = Math.random() * windowWidth;
          
          // Add new star with timestamp
          setStars(prev => [...prev, { 
            id: nextId, 
            x, 
            timestamp: Date.now() 
          }]);
          setNextId(prev => prev + 1);
        }
        
        // Schedule next spawn
        scheduleNextSpawn();
      }, nextSpawnTime);
    };
    
    // Start the first spawn
    scheduleNextSpawn();
    
    // Cleanup function
    return () => {
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }
    };
  }, [nextId, stars.length]);
  
  // Cleanup stars that have been alive too long or have left the screen
  useEffect(() => {
    // Check every second for stars to remove
    cleanupIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const windowHeight = window.innerHeight;
      
      setStars(prev => prev.filter(star => {
        const age = now - star.timestamp;
        const estimatedYPosition = -10 + (age / 1000) * (0.5 * 60); // Approximate y position based on speed
        
        // Keep star if it's less than 30 seconds old AND still on screen
        return age < 30000 && estimatedYPosition < windowHeight;
      }));
    }, 1000);
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);
  
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
