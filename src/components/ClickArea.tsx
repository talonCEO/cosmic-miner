
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, getRandomPosition } from '@/utils/gameLogic';
import { Sparkles, Pickaxe } from 'lucide-react';

// Particle effect component
interface ParticleProps {
  x: number;
  y: number;
  color: string;
  onAnimationEnd: () => void;
}

const Particle: React.FC<ParticleProps> = ({ x, y, color, onAnimationEnd }) => {
  const randomSize = Math.floor(Math.random() * 4) + 2; // 2-5px
  const randomDuration = (Math.random() * 0.5) + 0.5; // 0.5-1s
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
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPickaxe, setShowPickaxe] = useState(false);
  const nextId = useRef(0);
  
  // Get element color based on current coins
  const getElementColor = () => {
    const coins = state.coins;
    if (coins < 100) return "#81D4FA"; // Hydrogen (blue)
    if (coins < 1000) return "#424242"; // Carbon (dark grey)
    if (coins < 10000) return "#90CAF9"; // Oxygen (light blue)
    if (coins < 100000) return "#CB8D73"; // Iron (rust)
    if (coins < 1000000) return "#D87F46"; // Copper (orange-brown)
    if (coins >= 1000000) return "#FFC107"; // Gold (yellow)
    return "#BA68C8"; // Default: rare element (purple)
  };
  
  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    
    // Add particle effects
    const particleCount = Math.min(5 + Math.floor(state.coinsPerClick / 100), 15);
    const newParticles = [];
    const elementColor = getElementColor();
    
    for (let i = 0; i < particleCount; i++) {
      const { x: particleX, y: particleY } = getRandomPosition(centerX, centerY, 70);
      newParticles.push({ 
        id: nextId.current++, 
        x: particleX, 
        y: particleY,
        color: elementColor
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Trigger click handler
    handleClick();
    
    // Add button animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
    
    // Show pickaxe animation
    setShowPickaxe(true);
    setTimeout(() => setShowPickaxe(false), 300);
  };
  
  // Remove effects after animation
  const removeClickEffect = (id: number) => {
    setClickEffects(prev => prev.filter(effect => effect.id !== id));
  };
  
  const removeParticle = (id: number) => {
    setParticles(prev => prev.filter(particle => particle.id !== id));
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div 
        ref={containerRef}
        className="relative w-64 h-64 mb-5 flex items-center justify-center select-none"
      >
        {/* Mining area with sparkle effect */}
        <div 
          className={`w-48 h-48 rounded-full bg-gradient-to-br from-white to-slate-100 shadow-lg flex items-center justify-center cursor-pointer transition-transform relative overflow-visible
            ${isAnimating ? 'animate-pulse-click' : ''}`}
          onClick={handleAreaClick}
        >
          {/* Subtle sparkle effect */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <Sparkles className="w-36 h-36 text-slate-300" />
          </div>
          
          <div className="text-center z-10">
            <p className="text-3xl font-semibold mb-2 text-game-accent">{formatNumber(state.coins)}</p>
            <p className="text-sm text-game-text-secondary">
              +{formatNumber(state.coinsPerClick)} per tap
            </p>
          </div>
          
          {/* Mining pickaxe animation */}
          {showPickaxe && (
            <div className="absolute -right-2 -top-8 animate-mining z-20">
              <Pickaxe size={32} className="text-slate-600" />
            </div>
          )}
          
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
        
        {/* Particle effects rendering */}
        {particles.map(particle => (
          <Particle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            color={particle.color}
            onAnimationEnd={() => removeParticle(particle.id)}
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
