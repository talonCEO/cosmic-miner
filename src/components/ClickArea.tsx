
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, getRandomPosition } from '@/utils/gameLogic';

// Click effect component
interface ClickEffectProps {
  x: number;
  y: number;
  value: number;
  onAnimationEnd: () => void;
}

const ClickEffect: React.FC<ClickEffectProps> = ({ x, y, value, onAnimationEnd }) => {
  return (
    <div 
      className="click-effect text-game-accent font-medium"
      style={{ left: x, top: y }}
      onAnimationEnd={onAnimationEnd}
    >
      +{formatNumber(value)}
    </div>
  );
};

const ClickArea: React.FC = () => {
  const { state, handleClick } = useGame();
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextId = useRef(0);
  
  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get click position relative to the container
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Add visual effect
    const { x, y } = getRandomPosition(centerX, centerY, 60);
    
    setClickEffects(prev => [
      ...prev, 
      { id: nextId.current++, x, y }
    ]);
    
    // Trigger click handler
    handleClick();
    
    // Add button animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
  };
  
  // Remove click effects after animation
  const removeClickEffect = (id: number) => {
    setClickEffects(prev => prev.filter(effect => effect.id !== id));
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div 
        ref={containerRef}
        className="relative w-64 h-64 mb-5 flex items-center justify-center select-none"
      >
        {/* Inner circle with shadow */}
        <div 
          className={`w-48 h-48 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer transition-transform relative overflow-visible
            ${isAnimating ? 'animate-pulse-click' : ''}`}
          onClick={handleAreaClick}
        >
          <div className="text-center z-10">
            <p className="text-3xl font-semibold mb-2 text-game-accent">{formatNumber(state.coins)}</p>
            <p className="text-sm text-game-text-secondary">
              +{formatNumber(state.coinsPerClick)} per tap
            </p>
          </div>
          
          {/* Subtle rings around the main circle */}
          <div className="absolute w-full h-full rounded-full border-4 border-white opacity-50"></div>
          <div className="absolute w-[110%] h-[110%] rounded-full border-2 border-white opacity-30"></div>
          <div className="absolute w-[120%] h-[120%] rounded-full border border-white opacity-20"></div>
        </div>
        
        {/* Click effects rendering */}
        {clickEffects.map(effect => (
          <ClickEffect 
            key={effect.id}
            x={effect.x}
            y={effect.y}
            value={state.coinsPerClick}
            onAnimationEnd={() => removeClickEffect(effect.id)}
          />
        ))}
      </div>
      
      {/* Passive income indicator */}
      {state.coinsPerSecond > 0 && (
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-sm text-game-text-secondary">
            +{formatNumber(state.coinsPerSecond)} coins per second
          </p>
        </div>
      )}
    </div>
  );
};

export default ClickArea;
