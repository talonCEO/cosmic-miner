
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
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size?: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextId = useRef(0);
  
  const calculateClickValue = () => {
    // Get tap multiplier from tap power upgrade
    const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
    const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
    
    // Calculate click multiplier from artifacts
    const clickMultiplier = state.ownedArtifacts.includes("artifact-2") ? 1.5 : 1;  // Space Rocket
    let extraMultiplier = 0;
    
    // Check for Space Rocket perks
    const rocketArtifact = state.artifacts.find(a => a.id === "artifact-2");
    if (rocketArtifact && rocketArtifact.perks) {
      const unlockedPerks = rocketArtifact.perks.filter(p => p.unlocked);
      if (unlockedPerks.length > 0) {
        // Use the highest unlocked perk value
        const highestPerk = unlockedPerks.reduce((prev, current) => 
          prev.effect.value > current.effect.value ? prev : current
        );
        extraMultiplier = highestPerk.effect.value - 1.5; // Subtract base value
      }
    }
    
    // Check for Molecular Flask and its perks
    if (state.ownedArtifacts.includes("artifact-7")) {
      extraMultiplier += 2.5; // Molecular Flask base bonus
      
      const flaskArtifact = state.artifacts.find(a => a.id === "artifact-7");
      if (flaskArtifact && flaskArtifact.perks) {
        const unlockedPerks = flaskArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Use the highest unlocked perk value
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          extraMultiplier = highestPerk.effect.value - 1; // Use highest value instead
        }
      }
    }
    
    const artifactMultiplier = clickMultiplier + extraMultiplier;
    
    // Apply base value and bonuses
    const baseClickValue = state.coinsPerClick; 
    const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
    
    // Apply tech tree ability bonuses
    let abilityTapMultiplier = 1;
    if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
      abilityTapMultiplier += 0.5; // Quantum Vibration Enhancer: +50% tap power
    }
    if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
      abilityTapMultiplier += 0.85; // Plasma Discharge Excavator: +85% tap value
    }
    if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
      abilityTapMultiplier += 1.2; // Supernova Core Extractor: +120% tap value
    }
    
    return (baseClickValue + coinsPerSecondBonus) * state.incomeMultiplier * artifactMultiplier * tapBoostMultiplier * abilityTapMultiplier;
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
