
import React, { useState, useEffect, useCallback } from 'react';
import PowerupObject from './PowerupObject';
import { useToast } from "@/components/ui/use-toast";
import { useGame } from '@/context/GameContext';

interface Powerup {
  id: number;
  type: 'star' | 'orb' | 'cube';
  position: { x: number; y: number };
}

const PowerupsManager: React.FC = () => {
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const { toast } = useToast();
  const { state, handleClick } = useGame();
  
  // Function to generate a random spawn time between 30 and 300 seconds
  const getRandomSpawnTime = useCallback(() => {
    return Math.floor(Math.random() * (300 - 30 + 1) + 30) * 1000;
  }, []);
  
  // Function to generate a random position at the top of the screen
  const getRandomPosition = useCallback(() => {
    const margin = 100; // margin from the edges
    return {
      x: Math.floor(Math.random() * (window.innerWidth - margin * 2) + margin),
      y: -100, // Start above the screen
    };
  }, []);
  
  // Function to spawn a powerup
  const spawnPowerup = useCallback((type: 'star' | 'orb' | 'cube') => {
    const position = getRandomPosition();
    const newPowerup: Powerup = {
      id: Date.now(),
      type,
      position,
    };
    
    setPowerups(prevPowerups => [...prevPowerups, newPowerup]);
    
    // Schedule next spawn
    setTimeout(() => {
      spawnPowerup(type);
    }, getRandomSpawnTime());
  }, [getRandomPosition, getRandomSpawnTime]);
  
  // Initialize powerup spawning
  useEffect(() => {
    // Start spawning each type after a random delay
    const starTimeout = setTimeout(() => spawnPowerup('star'), getRandomSpawnTime());
    const orbTimeout = setTimeout(() => spawnPowerup('orb'), getRandomSpawnTime());
    const cubeTimeout = setTimeout(() => spawnPowerup('cube'), getRandomSpawnTime());
    
    return () => {
      clearTimeout(starTimeout);
      clearTimeout(orbTimeout);
      clearTimeout(cubeTimeout);
    };
  }, [spawnPowerup, getRandomSpawnTime]);
  
  // Handle powerup click
  const handlePowerupClick = useCallback((id: number, type: 'star' | 'orb' | 'cube') => {
    // Remove the powerup
    setPowerups(prevPowerups => prevPowerups.filter(p => p.id !== id));
    
    // Apply powerup effect based on type
    switch (type) {
      case 'star':
        // Star gives bonus coins
        const starBonus = state.coinsPerClick * 10;
        handleClick();
        handleClick();
        handleClick();
        toast({
          title: "Star Power!",
          description: `Gained ${starBonus} bonus coins!`,
          duration: 3000,
        });
        break;
        
      case 'orb':
        // Orb temporarily boosts clicking power
        toast({
          title: "Orb Power!",
          description: "Click power boosted for a short time!",
          duration: 3000,
        });
        // In a real implementation, we would add a temporary boost to clicking power
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        break;
        
      case 'cube':
        // Cube gives random resources
        toast({
          title: "Cube Power!",
          description: "Random resources acquired!",
          duration: 3000,
        });
        // In a real implementation, this would provide random upgrade levels
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        break;
    }
  }, [handleClick, state.coinsPerClick, toast]);
  
  // Handle powerup going off screen
  const handleOffScreen = useCallback((id: number) => {
    setPowerups(prevPowerups => prevPowerups.filter(p => p.id !== id));
  }, []);
  
  return (
    <div className="powerups-container pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {powerups.map(powerup => (
        <PowerupObject
          key={powerup.id}
          type={powerup.type}
          position={powerup.position}
          onOffScreen={() => handleOffScreen(powerup.id)}
          onClick={() => handlePowerupClick(powerup.id, powerup.type)}
        />
      ))}
    </div>
  );
};

export default PowerupsManager;
