
import React, { useState, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import AnimatedAsteroid from './AnimatedAsteroid';

const ClickArea: React.FC = () => {
  const { addCoins, clickPower, formatNumber, tapPowerMultiplier, prestigeMultiplier } = useGameContext();
  const [clickCoordinates, setClickCoordinates] = useState<{ x: number; y: number }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const calculateClickPower = () => {
    const baseClickPower = clickPower * prestigeMultiplier;
    return baseClickPower * tapPowerMultiplier;
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickValue = calculateClickPower();
    addCoins(clickValue);
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);
    
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
        <AnimatedAsteroid onClick={() => {}} isAnimating={isAnimating} />
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
