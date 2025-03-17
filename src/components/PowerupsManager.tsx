
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import PowerupObject from './PowerupObject';

const PowerupsManager: React.FC = () => {
  const { state, handleClick } = useGame();
  const [isPowerupActive, setIsPowerupActive] = useState(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);
  const [powerupTimer, setPowerupTimer] = useState(0);
  
  // Active powerup effects
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [passiveMultiplier, setPassiveMultiplier] = useState(1);
  const [essenceMultiplier, setEssenceMultiplier] = useState(1);
  
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (isPowerupActive && powerupTimer > 0) {
      timer = setInterval(() => {
        setPowerupTimer(prev => {
          if (prev <= 1) {
            // Deactivate powerup when timer reaches 0
            setIsPowerupActive(false);
            setActivePowerupType(null);
            
            // Reset multipliers
            setClickMultiplier(1);
            setPassiveMultiplier(1);
            setEssenceMultiplier(1);
            
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPowerupActive, powerupTimer]);
  
  // Check for active powerups from context
  useEffect(() => {
    if (state.activeBoosts && state.activeBoosts.length > 0) {
      const currentTime = Date.now();
      
      for (const boost of state.activeBoosts) {
        if (boost.remainingTime && boost.remainingTime > 0) {
          // Apply boost effects based on type
          switch (boost.type) {
            case 'coinMultiplier':
              setClickMultiplier(boost.value);
              setPassiveMultiplier(boost.value);
              break;
            case 'coinsPerClick':
              setClickMultiplier(boost.value);
              break;
            case 'coinsPerSecond':
              setPassiveMultiplier(boost.value);
              break;
            case 'essenceMultiplier':
              setEssenceMultiplier(boost.value);
              break;
            default:
              break;
          }
          
          // Set powerup as active
          setIsPowerupActive(true);
          setActivePowerupType(boost.type);
          setPowerupTimer(boost.remainingTime);
        }
      }
    }
  }, [state.activeBoosts]);
  
  const getPowerupColor = (type: string | null): string => {
    switch (type) {
      case 'coinMultiplier':
        return 'blue';
      case 'coinsPerClick':
        return 'green';
      case 'coinsPerSecond':
        return 'orange';
      case 'essenceMultiplier':
        return 'purple';
      default:
        return 'blue';
    }
  };
  
  const getPowerupEmoji = (type: string | null): string => {
    switch (type) {
      case 'coinMultiplier':
        return '💰';
      case 'coinsPerClick':
        return '👆';
      case 'coinsPerSecond':
        return '⏱️';
      case 'essenceMultiplier':
        return '✨';
      default:
        return '🔮';
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getMultiplierText = (type: string | null): string => {
    switch (type) {
      case 'coinMultiplier':
        return `${clickMultiplier}x Coins`;
      case 'coinsPerClick':
        return `${clickMultiplier}x Tap`;
      case 'coinsPerSecond':
        return `${passiveMultiplier}x CPS`;
      case 'essenceMultiplier':
        return `${essenceMultiplier}x Essence`;
      default:
        return 'Active Boost';
    }
  };
  
  // Generate random powerups at random positions
  const generateRandomPowerups = () => {
    // Map powerup types to the expected PowerupObject types
    const powerupTypeMapping: { [key: string]: "star" | "orb" | "cube" } = {
      'coinMultiplier': 'star',
      'coinsPerClick': 'orb',
      'coinsPerSecond': 'cube'
    };
    
    const powerupTypes = ['coinMultiplier', 'coinsPerClick', 'coinsPerSecond'];
    const powerupPositions = [
      {x: Math.random() * 60 + 20, y: Math.random() * 60 + 20},
      {x: Math.random() * 60 + 20, y: Math.random() * 60 + 20}
    ];
    
    return (
      <>
        {powerupPositions.map((pos, index) => {
          const powerupKey = powerupTypes[index % powerupTypes.length];
          const powerupType = powerupTypeMapping[powerupKey]; 
          
          return (
            <PowerupObject 
              key={index}
              type={powerupType}
              position={pos}
              onOffScreen={() => {/* Handle off screen event */}}
              onClick={() => handleClick(1)}
            />
          );
        })}
      </>
    );
  };
  
  return (
    <>
      {/* Powerup indicator */}
      {isPowerupActive && powerupTimer > 0 && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`fixed top-20 left-50% transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg
                      bg-${getPowerupColor(activePowerupType)}-500/80 backdrop-blur-sm 
                      text-white font-medium z-50 flex items-center gap-2`}
        >
          <span className="text-xl">{getPowerupEmoji(activePowerupType)}</span>
          <span>{getMultiplierText(activePowerupType)}</span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full text-sm">
            {formatTime(powerupTimer)}
          </span>
        </motion.div>
      )}
      
      {/* Random powerups (will appear rarely) */}
      {Math.random() < 0.01 && generateRandomPowerups()}
    </>
  );
};

export default PowerupsManager;
