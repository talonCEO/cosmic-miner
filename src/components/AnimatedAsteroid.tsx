
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

// World-specific colors
const WORLD_COLORS = {
  1: { // Asteroid Belt
    main: ['#b0b0b0', '#808080', '#404040'],
    crater: 'rgba(30, 30, 30, 0.5)',
    highlight: 'rgba(120, 120, 120, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    glow: 'rgba(180, 180, 220, 0.25)',
    particles: ["#FFD700", "#FFFF00", "#FFEC8B", "#FFC125"]
  },
  2: { // Lunar Surface
    main: ['#e0e0e0', '#c0c0c0', '#909090'],
    crater: 'rgba(60, 60, 60, 0.5)',
    highlight: 'rgba(220, 220, 220, 0.5)',
    shadow: 'rgba(30, 30, 30, 0.5)',
    glow: 'rgba(200, 200, 240, 0.2)',
    particles: ["#E0E0E0", "#D0D0D0", "#C0C0C0", "#B0B0B0"]
  },
  3: { // Mars Mines
    main: ['#d58a63', '#c26b43', '#a04f2a'],
    crater: 'rgba(70, 30, 15, 0.5)',
    highlight: 'rgba(230, 150, 120, 0.5)',
    shadow: 'rgba(50, 20, 10, 0.5)',
    glow: 'rgba(255, 200, 180, 0.25)',
    particles: ["#FF6347", "#FF7F50", "#FF8C69", "#FFA07A"]
  },
  4: { // Europa Ice Fields
    main: ['#a0c8e0', '#80a0c0', '#607080'],
    crater: 'rgba(40, 60, 80, 0.5)',
    highlight: 'rgba(200, 230, 255, 0.5)',
    shadow: 'rgba(20, 40, 60, 0.5)',
    glow: 'rgba(150, 200, 255, 0.3)',
    particles: ["#ADD8E6", "#B0E0E6", "#87CEEB", "#87CEFA"]
  },
  5: { // Saturn's Rings
    main: ['#e0c080', '#c0a060', '#a08040'],
    crater: 'rgba(80, 60, 40, 0.5)',
    highlight: 'rgba(255, 230, 180, 0.5)',
    shadow: 'rgba(60, 40, 20, 0.5)',
    glow: 'rgba(255, 240, 200, 0.35)',
    particles: ["#FFD700", "#F0E68C", "#DAA520", "#B8860B"]
  },
  6: { // Titan Methane Lakes
    main: ['#607890', '#405870', '#203050'],
    crater: 'rgba(20, 30, 50, 0.5)',
    highlight: 'rgba(100, 140, 180, 0.5)',
    shadow: 'rgba(10, 20, 40, 0.5)',
    glow: 'rgba(100, 160, 220, 0.3)',
    particles: ["#4682B4", "#5F9EA0", "#6495ED", "#7B68EE"]
  },
  7: { // Uranus Gas Clouds
    main: ['#80c0c0', '#60a0a0', '#408080'],
    crater: 'rgba(40, 80, 80, 0.5)',
    highlight: 'rgba(160, 240, 240, 0.5)',
    shadow: 'rgba(20, 60, 60, 0.5)',
    glow: 'rgba(160, 255, 255, 0.3)',
    particles: ["#40E0D0", "#48D1CC", "#00CED1", "#20B2AA"]
  },
  8: { // Neptune's Core
    main: ['#4060a0', '#304080', '#202060'],
    crater: 'rgba(20, 20, 60, 0.5)',
    highlight: 'rgba(80, 120, 200, 0.5)',
    shadow: 'rgba(10, 10, 40, 0.5)',
    glow: 'rgba(100, 140, 255, 0.4)',
    particles: ["#1E90FF", "#4169E1", "#0000FF", "#0000CD"]
  },
  9: { // Kuiper Belt
    main: ['#a0a0c0', '#8080a0', '#606080'],
    crater: 'rgba(40, 40, 60, 0.5)',
    highlight: 'rgba(180, 180, 220, 0.5)',
    shadow: 'rgba(30, 30, 50, 0.5)',
    glow: 'rgba(180, 180, 255, 0.35)',
    particles: ["#9370DB", "#8A2BE2", "#9400D3", "#BA55D3"]
  },
  10: { // Oort Cloud
    main: ['#c060c0', '#a040a0', '#802080'],
    crater: 'rgba(60, 20, 60, 0.5)',
    highlight: 'rgba(240, 120, 240, 0.5)',
    shadow: 'rgba(40, 10, 40, 0.5)',
    glow: 'rgba(255, 150, 255, 0.4)',
    particles: ["#FF00FF", "#FF69B4", "#DA70D6", "#EE82EE"]
  },
};

// Create glowing orb component
const GlowingOrb: React.FC<{
  index: number;
  worldId: number;
}> = ({ index, worldId }) => {
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
  const worldId = state.currentWorld;
  
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
  }, [worldId]); // Reset craters when world changes
  
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
  
  // Reset vertex variations when world changes
  useEffect(() => {
    vertexVariations.current = Array.from(
      { length: BASE_POINTS }, 
      () => Math.random() * 0.4 - 0.2
    );
  }, [worldId]);
  
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
    
    // Get world-specific colors
    const worldColors = WORLD_COLORS[worldId as keyof typeof WORLD_COLORS] || WORLD_COLORS[1];
    
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
    
    // Create gradient for the asteroid body - use world-specific colors
    const gradient = ctx.createRadialGradient(
      -BASE_RADIUS * 0.4, -BASE_RADIUS * 0.4, 0,
      0, 0, BASE_RADIUS * 1.2
    );
    gradient.addColorStop(0, worldColors.main[0]);
    gradient.addColorStop(0.4, worldColors.main[1]);
    gradient.addColorStop(0.8, worldColors.main[2]);
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
      ctx.fillStyle = worldColors.crater; 
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
      ctx.fillStyle = worldColors.highlight;
      ctx.fill();
      
      // Draw crater inner shadow
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = worldColors.shadow;
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
  }, [shadowOffsetX, shadowOffsetY, craters, worldId]);
  
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
  
  // Get world-specific colors
  const worldColors = WORLD_COLORS[worldId as keyof typeof WORLD_COLORS] || WORLD_COLORS[1];
  
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Pulsating glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, transparent 30%, ${worldColors.glow} 70%, transparent 100%)`,
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
          <GlowingOrb key={`orb-${i}`} index={i} worldId={worldId} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedAsteroid;
