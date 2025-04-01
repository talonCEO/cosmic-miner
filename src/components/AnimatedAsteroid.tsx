import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import defaultSprite from '@/assets/world1.png';
import { useGame } from '@/context/GameContext'; // Explicitly import useGame

// Import 27 noise images dynamically (assuming Vite)
const noiseImages = Object.values(
  import.meta.glob('@/assets/noise[0-2][0-6].png', { eager: true, as: 'url' })
).slice(0, 27); // Ensure exactly 27 images (noise00.png to noise26.png)

interface AnimatedAsteroidProps {
  onClick: () => void;
  isAnimating: boolean;
}

const ASTEROID_SIZE = 315; // Reduced from 350 by 10%

const GlowingOrb: React.FC<{ index: number }> = ({ index }) => {
  const angle = (index / 12) * Math.PI * 2;
  const radius = 150 + Math.random() * 30;
  const baseX = Math.cos(angle) * radius;
  const baseY = Math.sin(angle) * radius;

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: 2 + Math.random() * 4,
        height: 2 + Math.random() * 4,
        x: baseX,
        y: baseY,
        boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.4)",
      }}
      animate={{
        y: [baseY - 15, baseY + 15, baseY - 15],
        opacity: [0.2, 0.7, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2,
        ease: "easeInOut",
      }}
    />
  );
};

const AnimatedAsteroid: React.FC<AnimatedAsteroidProps> = ({ onClick, isAnimating }) => {
  const [currentNoiseIndex, setCurrentNoiseIndex] = useState(0);
  const { state } = useGame(); // Use the imported hook
  const currentWorldSprite = state.worlds.find(w => w.id === state.currentWorld)?.sprite || defaultSprite;

  // Animation values
  const rotation = useMotionValue(0);
  const scale = useMotionValue(1);
  const glowRadius = useMotionValue(1);
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);

  // Transformed values
  const rotationTransform = useTransform(rotation, (value) => `rotate(${value}deg)`);
  const scaleTransform = useTransform(scale, (value) => `scale(${value})`);
  const glowScale = useTransform(glowRadius, (radius) => radius);
  const shakeTransform = useTransform([shakeX, shakeY], ([x, y]) => `translate(${x}px, ${y}px)`);

  // Base animations
  useEffect(() => {
    animate(rotation, 360, { duration: 30, repeat: Infinity, ease: "linear" });
    animate(glowRadius, 1.1, { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" });
  }, [rotation, glowRadius]);

  // Noise animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNoiseIndex((prev) => (prev + 1) % noiseImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Click animations (subtle shake + scale + glow)
  useEffect(() => {
    if (isAnimating) {
      // Subtle scale squeeze
      animate(scale, 0.97, {
        duration: 0.15,
        type: "spring",
        stiffness: 500,
        damping: 15,
        onComplete: () => animate(scale, 1, { duration: 0.2, type: "spring", stiffness: 200, damping: 10 }),
      });

      // Subtle internal shake (complements ShakeWrapper)
      animate(shakeX, [0, -2, 2, -1, 1, 0], {
        duration: 0.25,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: "easeInOut",
      });
      animate(shakeY, [0, -1, 1, -1, 1, 0], {
        duration: 0.25,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: "easeInOut",
        onComplete: () => {
          shakeX.set(0);
          shakeY.set(0);
        },
      });

      // Glow pulse
      animate(glowRadius, 1.2, {
        duration: 0.2,
        ease: "easeOut",
        onComplete: () => animate(glowRadius, 1.1, { duration: 0.3, ease: "easeIn" }),
      });
    }
  }, [isAnimating, scale, shakeX, shakeY, glowRadius]);

  return (
    <div className="relative" style={{ width: ASTEROID_SIZE, height: ASTEROID_SIZE }}>
      {/* Pulsating glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, transparent 30%, rgba(180, 180, 220, 0.25) 70%, transparent 100%)',
          width: '100%',
          height: '100%',
          scale: glowScale,
        }}
      />
      {/* Main asteroid container */}
      <motion.div
        className="w-full h-full cursor-pointer relative"
        style={{
          transform: shakeTransform,
        }}
        onClick={onClick}
      >
        {/* Asteroid sprite */}
        <motion.img
          src={currentWorldSprite} // Use dynamic sprite
          alt="Asteroid"
          className="w-full h-full object-contain absolute"
          style={{ transform: [rotationTransform, scaleTransform] }}
          draggable={false}
        />
        {/* Noise overlay */}
        <AnimatePresence>
          <motion.img
            key={currentNoiseIndex}
            src={noiseImages[currentNoiseIndex]}
            alt="Noise Overlay"
            className="w-full h-full object-cover absolute"
            style={{
              transform: [rotationTransform, scaleTransform],
              mixBlendMode: 'soft-light',
              opacity: 0.15,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: "easeInOut" }}
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>
      {/* Glowing orbs (uncomment to reintroduce) */}
      {/* <div className="absolute w-full h-full pointer-events-none flex items-center justify-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <GlowingOrb key={`orb-${i}`} index={i} />
        ))}
      </div> */}
    </div>
  );
};

export default AnimatedAsteroid;