import React, { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, getRandomPosition } from '@/utils/gameLogic';
import AnimatedAsteroid from './AnimatedAsteroid';

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
      className="click-effect text-purple-400 font-medium text-shadow-glow"
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
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size?: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextId = useRef(0);
  
  // Get asteroid color based on current coins
  const getAsteroidColor = () => {
    // Grey with gradient
    return "#8E9196"; 
  };
  
  const handleAreaClick = () => {
    // Get click position relative to the container
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Add numeric value effect
    const { x: effectX, y: effectY } = getRandomPosition(centerX, centerY, 60);
    
    setClickEffects(prev => [
      ...prev, 
      { id: nextId.current++, x: effectX, y: effectY }
    ]);
    
    // Add particle effects - space debris from asteroid
    const particleCount = Math.min(10 + Math.floor(state.coinsPerClick / 100), 20);
    const newParticles = [];
    const asteroidColor = getAsteroidColor();
    
    // Create diverse space debris
    for (let i = 0; i < particleCount; i++) {
      const { x: particleX, y: particleY } = getRandomPosition(centerX, centerY, 70);
      const size = Math.random() * 5 + 2; // Varied sizes for debris
      
      // Mix of colors for richer debris effect
      const colors = [
        asteroidColor, 
        "#ffffff", // Some white sparkles
        "#c0c0c0", // Silver
        "#808080"  // Gray
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
    
    // Trigger click handler
    handleClick();
    
    // Add button animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
  };
  
  // Remove effects after animation
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
        <div 
          className="absolute w-64 h-64 rounded-full cursor-pointer"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${getAsteroidColor()}, #1a1a2e)`,
            animation: 'opacity-pulse 3s infinite alternate',
            opacity: '0.9',
          }}
          onClick={handleAreaClick}
        ></div>
        
        {/* Animated asteroid without overlayed text */}
        <div 
          className="w-64 h-64 rounded-full cursor-pointer"
          onClick={handleAreaClick}
        >
          <AnimatedAsteroid 
            onClick={handleAreaClick}
            isAnimating={isAnimating}
          />
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
        
        {/* Particle effects rendering */}
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
      
      {/* Passive income indicator */}
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
