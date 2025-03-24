import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, useAnimation, useMotionValue, useTransform, animate } from 'framer-motion';
import { useInterval } from '@/hooks/useInterval';

interface AnimatedAsteroidProps {
  onClick: () => void;
  isAnimating: boolean;
}

const ASTEROID_SIZE = 350;
const BASE_POINTS = 18; // More points for smoother shape
const BASE_RADIUS = 150;

// Create glowing orb component
const GlowingOrb: React.FC<{
  index: number;
}> = ({ index }) => {
  const angle = (index / 12) * Math.PI * 2;
  const radius = 170 + Math.random() * 30;
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
        boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.4)"
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
        ease: "easeInOut"
      }}
    />
  );
};

// Define a CraterType interface
interface CraterType {
  x: number;
  y: number;
  size: number;
}

// Helper function to check if craters overlap
const cratersOverlap = (crater1: CraterType, crater2: CraterType): boolean => {
  const distance = Math.sqrt(Math.pow(crater1.x - crater2.x, 2) + Math.pow(crater1.y - crater2.y, 2));
  return distance < (crater1.size + crater2.size);
};

const AnimatedAsteroid: React.FC<AnimatedAsteroidProps> = ({ onClick, isAnimating }) => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation values with Framer Motion
  const rotation = useMotionValue(0);
  const wobbleX = useMotionValue(0);
  const wobbleY = useMotionValue(0);
  const scale = useMotionValue(1);
  const shadowOffsetX = useMotionValue(15);
  const shadowOffsetY = useMotionValue(15);
  const glowRadius = useMotionValue(1);
  
  // Reference for vertex variations
  const vertexVariations = useRef<number[]>([]);
  
  // Transformed values
  const rotationTransform = useTransform(rotation, value => `rotate(${value}deg)`);
  const wobbleTransform = useTransform(
    [wobbleX, wobbleY], 
    ([x, y]) => `rotateX(${x}deg) rotateY(${y}deg)`
  );
  const scaleTransform = useTransform(scale, value => `scale(${value})`);
  const glowScale = useTransform(glowRadius, radius => radius);
  
  // Crater states
  const [craters, setCraters] = useState<CraterType[]>([]);
  
  // Initialize craters
  useEffect(() => {
    const craterCount = 10;
    const tempCraters: CraterType[] = [];
    
    // Generate craters that don't overlap
    for (let i = 0; i < craterCount; i++) {
      let attempts = 0;
      let validCrater = false;
      let newCrater: CraterType = { x: 0, y: 0, size: 0 };
      
      while (!validCrater && attempts < 50) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * BASE_RADIUS * 0.7;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = Math.random() * 20 + 10;
        
        newCrater = { x, y, size };
        
        // Check if this crater overlaps with any existing craters
        validCrater = !tempCraters.some(existingCrater => 
          cratersOverlap(newCrater, existingCrater)
        );
        
        attempts++;
      }
      
      if (validCrater) {
        tempCraters.push(newCrater);
      }
    }
    
    setCraters(tempCraters);
  }, []);
  
  // Generate asteroid path points
  const generateAsteroidPoints = () => {
    // Initialize random variations if not exist
    if (vertexVariations.current.length === 0) {
      vertexVariations.current = Array.from(
        { length: BASE_POINTS }, 
        () => Math.random() * 0.4 - 0.2
      );
    }
    
    return Array.from({ length: BASE_POINTS }, (_, i) => {
      const angle = (i / BASE_POINTS) * Math.PI * 2;
      // Apply the consistent variation
      const variation = vertexVariations.current[i];
      // Base radius + variation percentage
      const radius = BASE_RADIUS * (1 + variation);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { x, y };
    });
  };
  
  // Start all the animations
  useEffect(() => {
    // Slow continuous rotation - MUCH slower rotation (360 degrees over 3 minutes)
    animate(rotation, 360, {
      duration: 180, // 3 minutes for a full rotation
      repeat: Infinity,
      ease: "linear",
    });
    
    // Subtle wobble animation
    const wobbleAnimation = () => {
      animate(wobbleX, Math.random() * 8 - 4, {
        duration: 10,
        ease: "easeInOut",
        type: "spring",
        stiffness: 20,
        damping: 10,
      });
      
      animate(wobbleY, Math.random() * 8 - 4, {
        duration: 10,
        ease: "easeInOut",
        type: "spring",
        stiffness: 20,
        damping: 10,
      });
    };
    
    wobbleAnimation();
    const wobbleInterval = setInterval(wobbleAnimation, 10000);
    
    // Pulsating glow animation
    const glowAnimation = () => {
      animate(glowRadius, 1.1, {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      });
    };
    
    glowAnimation();
    
    // Subtle bouncing scale
    const scaleAnimation = () => {
      animate(scale, 1.025, {
        duration: 5,
        ease: "easeInOut",
        type: "spring",
        stiffness: 100,
        damping: 10,
        repeat: Infinity,
        repeatType: "reverse",
      });
    };
    
    scaleAnimation();
    
    // Clean up all animations
    return () => {
      clearInterval(wobbleInterval);
    };
  }, []);
  
  // Draw the asteroid on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = ASTEROID_SIZE;
    canvas.height = ASTEROID_SIZE;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current animation values
    const currentShadowX = shadowOffsetX.get();
    const currentShadowY = shadowOffsetY.get();
    
    // Start drawing
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Generate asteroid points
    const asteroidPoints = generateAsteroidPoints();
    
    // Draw asteroid shape
    ctx.beginPath();
    asteroidPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    
    // Add shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = currentShadowX;
    ctx.shadowOffsetY = currentShadowY;
    
    // Create gradient for the asteroid body
    const gradient = ctx.createRadialGradient(
      -BASE_RADIUS * 0.4, -BASE_RADIUS * 0.4, 0,
      0, 0, BASE_RADIUS * 1.2
    );
    gradient.addColorStop(0, '#b0b0b0');
    gradient.addColorStop(0.4, '#808080');
    gradient.addColorStop(0.8, '#404040');
    gradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Reset shadow for craters
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw craters with 50% opacity
    craters.forEach((crater) => {
      // Draw darker crater base
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 30, 30, 0.5)'; // 50% opacity
      ctx.fill();
      
      // Draw crater highlight
      ctx.beginPath();
      ctx.arc(
        crater.x - crater.size * 0.3,
        crater.y - crater.size * 0.3,
        crater.size * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(120, 120, 120, 0.5)'; // 50% opacity
      ctx.fill();
      
      // Draw crater inner shadow
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 50% opacity
      ctx.fill();
    });
    
    // Add surface details (tiny specks)
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * BASE_RADIUS;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() * 80 + 40}, ${Math.random() * 80 + 40}, ${Math.random() * 80 + 40}, 0.15)`;
      ctx.fill();
    }
    
    ctx.restore();
  }, [shadowOffsetX, shadowOffsetY, craters]);
  
  // Handle click animation
  useEffect(() => {
    if (isAnimating) {
      // Quick scale down and back
      animate(scale, 0.95, {
        duration: 0.15,
        type: "spring",
        stiffness: 500,
        damping: 15,
        onComplete: () => {
          animate(scale, 1, { 
            duration: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 10
          });
        }
      });
    }
  }, [isAnimating]);
  
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Pulsating glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, transparent 30%, rgba(180, 180, 220, 0.25) 70%, transparent 100%)',
          width: '100%',
          height: '100%',
          scale: glowScale
        }}
      />
      
      {/* Main asteroid with 3D-like transforms */}
      <motion.div
        className="w-full h-full cursor-pointer relative"
        style={{
          transformStyle: "preserve-3d",
          transform: wobbleTransform,
        }}
        onClick={onClick}
      >
        <motion.canvas
          ref={canvasRef}
          className="w-full h-full absolute"
          style={{
            transform: rotationTransform,
            scale: scaleTransform,
          }}
        />
      </motion.div>
      
      {/* Glowing orbs */}
      <div className="absolute w-full h-full pointer-events-none flex items-center justify-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <GlowingOrb key={`orb-${i}`} index={i} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedAsteroid;
