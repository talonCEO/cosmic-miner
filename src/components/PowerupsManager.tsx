
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PowerupObject from './PowerupObject';
import { useToast } from "@/components/ui/use-toast";
import { useGame } from '@/context/GameContext';

interface Powerup {
  id: number;
  type: 'star' | 'orb' | 'cube';
  position: { x: number; y: number };
}

interface PowerupTimer {
  type: 'star' | 'orb' | 'cube';
  timeLeft: number;
  color: string;
}

const PowerupsManager: React.FC = () => {
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [activeTimer, setActiveTimer] = useState<PowerupTimer | null>(null);
  const { state, handleClick } = useGame();
  const { toast } = useToast();
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get the color based on powerup type
  const getPowerupColor = useCallback((type: 'star' | 'orb' | 'cube'): string => {
    switch (type) {
      case 'star': return '#FFD700'; // Gold for star
      case 'orb': return '#FF4500'; // Red for orb
      case 'cube': return '#8A2BE2'; // Purple for cube
      default: return '#FFFFFF';
    }
  }, []);
  
  // Function to generate a random spawn time between 5 and 30 seconds (for testing, later can be 30-300)
  const getRandomSpawnTime = useCallback(() => {
    // For testing purposes - shorter spawn times
    return Math.floor(Math.random() * (30 - 5 + 1) + 5) * 1000;
  }, []);
  
  // Function to generate a random position at the top of the screen
  const getRandomPosition = useCallback(() => {
    const margin = 100; // margin from the edges
    return {
      x: Math.floor(Math.random() * (window.innerWidth - margin * 2) + margin),
      y: -50, // Start above the screen
    };
  }, []);
  
  // Function to schedule next spawn after respawn timer
  const scheduleNextSpawn = useCallback(() => {
    // Clear any existing timer
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }
    
    // Wait minimum 30 seconds plus a random additional time
    const respawnTime = 30000 + getRandomSpawnTime();
    
    spawnTimerRef.current = setTimeout(() => {
      if (powerups.length === 0) {
        const powerupTypes: ('star' | 'orb' | 'cube')[] = ['star', 'orb', 'cube'];
        const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        spawnPowerup(randomType);
      }
    }, respawnTime);
    
    console.log(`Next powerup scheduled in ${respawnTime / 1000} seconds`);
  }, [getRandomSpawnTime, powerups.length]);
  
  // Function to spawn a powerup
  const spawnPowerup = useCallback((type: 'star' | 'orb' | 'cube') => {
    // Only spawn if no powerups are currently on screen
    if (powerups.length === 0) {
      const position = getRandomPosition();
      const newPowerup: Powerup = {
        id: Date.now(),
        type,
        position,
      };
      
      setPowerups([newPowerup]);
      console.log(`Spawned ${type} powerup`);
    }
  }, [getRandomPosition, powerups.length]);
  
  // Initialize powerup spawning
  useEffect(() => {
    // Start immediate spawn for testing
    setTimeout(() => {
      if (powerups.length === 0) {
        const powerupTypes: ('star' | 'orb' | 'cube')[] = ['star', 'orb', 'cube'];
        const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        spawnPowerup(randomType);
      }
    }, 3000);
    
    // Log to verify initialization
    console.log("PowerupsManager initialized");
    
    return () => {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, [spawnPowerup]);
  
  // Timer effect for countdown
  useEffect(() => {
    if (!activeTimer) return;
    
    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev) return null;
        
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          return null;
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTimer]);
  
  // Handle powerup click
  const handlePowerupClick = useCallback((id: number, type: 'star' | 'orb' | 'cube') => {
    // Remove the powerup
    setPowerups([]);
    
    // Set active timer
    setActiveTimer({
      type,
      timeLeft: 10,
      color: getPowerupColor(type)
    });
    
    // Apply powerup effect based on type
    switch (type) {
      case 'star':
        // Star gives bonus coins
        handleClick();
        handleClick();
        handleClick();
        break;
        
      case 'orb':
        // Orb temporarily boosts clicking power
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        break;
        
      case 'cube':
        // Cube gives random resources
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        handleClick();
        break;
    }
    
    // Schedule next spawn after respawn timer
    scheduleNextSpawn();
  }, [handleClick, scheduleNextSpawn, getPowerupColor]);
  
  // Handle powerup going off screen
  const handleOffScreen = useCallback((id: number) => {
    setPowerups([]);
    // Schedule next spawn after respawn timer
    scheduleNextSpawn();
  }, [scheduleNextSpawn]);
  
  return (
    <>
      {/* Timer display */}
      {activeTimer && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 text-2xl font-bold animate-pulse"
             style={{ color: activeTimer.color }}>
          {activeTimer.timeLeft}s
        </div>
      )}
      
      {/* Powerups container */}
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
    </>
  );
};

export default PowerupsManager;
