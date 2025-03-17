
import React, { useState, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { AnimatedAsteroid } from './AnimatedAsteroid';

const ClickArea: React.FC = () => {
  const { addCoins, calculateClickPower, formatNumber, tapPowerMultiplier } = useGameContext();
  const [clickCoordinates, setClickCoordinates] = useState<{ x: number; y: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickValue = calculateClickPower();
    addCoins(clickValue);
    
    setClickCoordinates(prev => [...prev, { x, y }]);
    
    // Clean up old click coordinates after animation
    setTimeout(() => {
      setClickCoordinates(prev => prev.slice(1));
    }, 1000);
  }, [addCoins, calculateClickPower]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-64 h-64 md:w-80 md:h-80 relative">
        <AnimatedAsteroid />
      </div>
      
      {clickCoordinates.map((coord, index) => (
        <div 
          key={index}
          className="absolute pointer-events-none text-yellow-400 font-bold animate-fade-out"
          style={{ 
            left: `${coord.x}px`, 
            top: `${coord.y}px`, 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          +{formatNumber(calculateClickPower())}
          {tapPowerMultiplier > 1 && (
            <span className="text-orange-400 text-sm ml-1">
              ({tapPowerMultiplier}x)
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClickArea;
