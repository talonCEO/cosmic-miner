import React, { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, getRandomPosition } from '@/utils/gameLogic';
import AnimatedAsteroid from './AnimatedAsteroid';
import { useBoostManager } from '@/hooks/useBoostManager';

// Particle effect when clicking
interface ParticleProps {
  x: number;
  y: number;
  color: string;
  size?: number;
  duration?: number;
  onAnimationEnd: () => void;
}

const Particle: React.FC<ParticleProps> = ({ 
  x, y, color, size, duration, onAnimationEnd 
}) => {
  const randomSize = size || Math.floor(Math.random() * 4) + 2; // 2-5px
  const randomDuration = duration || (Math.random() * 0.5) + 0.5; // 0.5-1s
  const randomOpacity = (Math.random() * 0.5) + 0.5; // 0.5-1
  
  return (
    <div 
      className="absolute rounded-full pointer-events-none"
      style={{ 
        left: x, 
        top: y, 
        width: `${randomSize}px`, 
        height: `${randomSize}px`, 
        backgroundColor: color,
        opacity: randomOpacity,
        animation: `float-up ${randomDuration}s ease-out forwards`
      }}
      onAnimationEnd={onAnimationEnd}
    ></div>
  );
};

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
      className="click-effect text-green-400 font-medium text-shadow-glow"
      style={{ left: x, top: y }}
      onAnimationEnd={onAnimationEnd}
    >
      +{formatNumber(value)}
    </div>
  );
};

const ClickArea: React.FC = () => {
  const { state, click } = useGame();
  const { 
    calculateTapMultiplier, 
    calculateGlobalIncomeMultiplier 
  } = useBoostManager();
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size?: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextId = useRef(0);
  
  const calculateClickValue = () => {
    // Get tap multiplier from tap power upgrade
    const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
    const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
    
    // Use our centralized boost manager to get tap multiplier from artifacts and abilities
    const artifactMultiplier = calculateTapMultiplier();
    
    // Get global income multiplier that applies to all income sources
    const globalMultiplier = calculateGlobalIncomeMultiplier();
    
    // Apply base value and bonuses
    const baseClickValue = state.coinsPerClick; 
    const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
    
    // Apply all multipliers together (removed critical hit chance)
    return (baseClickValue + coinsPerSecondBonus) * 
           state.incomeMultiplier * 
           artifactMultiplier * 
           tapBoostMultiplier *
           globalMultiplier;
  };
  
  const handleAreaClick = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const { x: effectX, y: effectY } = getRandomPosition(centerX, centerY, 60);
    
    setClickEffects(prev => [
      ...prev, 
      { id: nextId.current++, x: effectX, y: effectY }
    ]);
    
    const particleCount = Math.min(8 + Math.floor(state.coinsPerClick / 100), 15);
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const { x: particleX, y: particleY } = getRandomPosition(centerX, centerY, 70);
      const size = Math.random() * 5 + 2;
      
      // Yellow sparkle colors
      const colors = [
        "#FFD700", // Gold
        "#FFFF00", // Yellow
        "#FFEC8B", // Light Yellow
        "#FFC125"  // Goldenrod
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      newParticles.push({ 
        id: nextId.current++, 
        x: particleX, 
        y: particleY,
        color: color,
        size: size
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    click();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
  };
  
  const removeClickEffect = (id: number) => {
    setClickEffects(prev => prev.filter(effect => effect.id !== id));
  };
  
  const removeParticle = (id: number) => {
    setParticles(prev => prev.filter(particle => particle.id !== id));
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-6 relative z-20">
      <div 
        ref={containerRef}
        className="relative w-64 h-64 mb-5 flex items-center justify-center select-none"
      >
        <div className="w-64 h-64 rounded-full cursor-pointer">
          <AnimatedAsteroid 
            onClick={handleAreaClick}
            isAnimating={isAnimating}
          />
        </div>
        
        {clickEffects.map(effect => (
          <ClickEffect 
            key={effect.id}
            x={effect.x}
            y={effect.y}
            value={calculateClickValue()}
            onAnimationEnd={() => removeClickEffect(effect.id)}
          />
        ))}
        
        {particles.map(particle => (
          <Particle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            color={particle.color}
            size={particle.size}
            onAnimationEnd={() => removeParticle(particle.id)}
          />
        ))}
      </div>
      
      {state.coinsPerSecond > 0 && (
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-sm text-white text-shadow-sm">
            +{formatNumber(state.coinsPerSecond)} coins per second
          </p>
        </div>
      )}
    </div>
  );
};

export default ClickArea;
