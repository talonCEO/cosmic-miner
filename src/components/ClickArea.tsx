import React, { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, getRandomPosition } from '@/utils/gameLogic';
import { calculateTapValue, calculateBaseTapValueWithoutCrit } from '@/utils/GameMechanics';
import AnimatedAsteroid from './AnimatedAsteroid';
import { useInterval } from '@/hooks/useInterval';
import ShakeWrapper from './ShakeWrapper';
import './ClickArea.css';

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  size?: number;
  duration?: number;
  onAnimationEnd: () => void;
}

const Particle: React.FC<ParticleProps> = ({ x, y, color, size, duration, onAnimationEnd }) => {
  const randomSize = size || Math.floor(Math.random() * 4) + 2;
  const randomDuration = duration || (Math.random() * 0.5) + 0.5;
  const randomOpacity = (Math.random() * 0.5) + 0.5;

  return (
    <div
      className="particle"
      style={{
        left: x,
        top: y,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        backgroundColor: color,
        opacity: randomOpacity,
        animation: `float-up ${randomDuration}s ease-out forwards`,
      }}
      onAnimationEnd={onAnimationEnd}
    />
  );
};

interface ClickEffectProps {
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
  onAnimationEnd: () => void;
}

const ClickEffect: React.FC<ClickEffectProps> = ({ x, y, value, isCritical, onAnimationEnd }) => {
  const className = isCritical ? 'click-effect critical' : 'click-effect normal';

  return (
    <div className={className} style={{ left: x, top: y }} onAnimationEnd={onAnimationEnd}>
      +{formatNumber(value)}
    </div>
  );
};

const ClickArea: React.FC = () => {
  const { state, click } = useGame();
  const [clickEffects, setClickEffects] = useState<
    Array<{ id: number; x: number; y: number; value: number; isCritical: boolean }>
  >([]);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string; size?: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextId = useRef(0);

  const handleAreaClick = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const { x: effectX, y: effectY } = getRandomPosition(centerX, centerY, 60);

    // Calculate base tap value without critical multiplier
    const baseTapValue = calculateBaseTapValueWithoutCrit(state);
    const critChance = state.activeBoosts.some(b => b.id === 'boost-critical-chance' && (b.remainingTime || 0) > 0)
      ? 1.0
      : state.abilities.find(a => a.id === "ability-5" && a.unlocked)
      ? 0.15
      : 0.10;

    // Determine if this is a critical hit
    const isCritical = Math.random() < critChance;
    const actualTapValue = isCritical ? baseTapValue * 5 : baseTapValue;

    setClickEffects((prev) => [
      ...prev,
      { id: nextId.current++, x: effectX, y: effectY, value: actualTapValue, isCritical },
    ]);

    const particleCount = Math.min(8 + Math.floor(state.coinsPerClick / 100), 15);
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const { x: particleX, y: particleY } = getRandomPosition(centerX, centerY, 70);
      const size = Math.random() * 5 + 2;
      const colors = isCritical
        ? ['#FF0000', '#FF3333', '#FF6666', '#FF9999'] // Red shades for crit
        : ['#FFD700', '#FFFF00', '#FFEC8B', '#FFC125']; // Yellow shades for normal
      const color = colors[Math.floor(Math.random() * colors.length)];
      newParticles.push({ id: nextId.current++, x: particleX, y: particleY, color, size });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    click(); // This still uses calculateTapValue in the reducer, but UI is now correct
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 250);
  };

  useInterval(() => {
    if (state.autoTapActive && containerRef.current) {
      handleAreaClick();
    }
  }, state.autoTapActive ? 200 : null);

  const removeClickEffect = (id: number) => {
    setClickEffects((prev) => prev.filter((effect) => effect.id !== id));
  };

  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 relative z-20">
      <div
        ref={containerRef}
        className="relative w-[315px] h-[315px] mb-5 flex items-center justify-center select-none"
      >
        <ShakeWrapper isShaking={isAnimating}>
          <AnimatedAsteroid onClick={handleAreaClick} isAnimating={isAnimating} />
        </ShakeWrapper>
        {clickEffects.map((effect) => (
          <ClickEffect
            key={effect.id}
            x={effect.x}
            y={effect.y}
            value={effect.value}
            isCritical={effect.isCritical}
            onAnimationEnd={() => removeClickEffect(effect.id)}
          />
        ))}
        {particles.map((particle) => (
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
            {/* Passive income display if needed */}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClickArea;