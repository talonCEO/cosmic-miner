
import React, { useEffect, useState } from 'react';
import ShootingStar from './ShootingStar';

const ShootingStarManager: React.FC = () => {
  const [stars, setStars] = useState<{id: number, timestamp: number}[]>([]);
  const [nextId, setNextId] = useState(0);
  const [canSpawn, setCanSpawn] = useState(true);
  
  // Manage star spawning
  useEffect(() => {
    // Try to spawn a new star every 333ms (3x faster than 1 second) if conditions are met
    const spawnInterval = setInterval(() => {
      if (canSpawn && stars.length < 4) { // Increased maximum to 4
        // Add a new star
        setStars(prev => [...prev, { id: nextId, timestamp: Date.now() }]);
        setNextId(prev => prev + 1);
        
        // Set cooldown between spawns - reduced from 10s to 3.33s to triple the spawn speed
        setCanSpawn(false);
        setTimeout(() => {
          setCanSpawn(true);
        }, 3333); // ~3.3 second delay between spawns (10000 / 3)
      }
    }, 333); // 3x faster than 1 second
    
    return () => clearInterval(spawnInterval);
  }, [canSpawn, stars, nextId]);
  
  const handleStarComplete = (id: number) => {
    setStars(prev => prev.filter(star => star.id !== id));
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(star => (
        <ShootingStar 
          key={star.id} 
          id={star.id}
          onComplete={() => handleStarComplete(star.id)} 
        />
      ))}
    </div>
  );
};

export default ShootingStarManager;
