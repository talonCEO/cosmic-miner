
import React, { useRef, useEffect } from 'react';
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

// Create dust particle component
const DustParticle: React.FC<{
  index: number;
  total: number;
  radius: number;
}> = ({ index, total, radius }) => {
  // Create particles in a circle with some random offset
  const angle = (index / total) * Math.PI * 2;
  const randomOffset = Math.random() * 20 - 10;
  const distance = radius + randomOffset;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  const initialDelay = Math.random() * 2;
  
  return (
    <motion.div
      className="absolute rounded-full bg-white/30"
      style={{
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        x: x,
        y: y,
      }}
      initial={{ opacity: 0.1 }}
      animate={{
        opacity: [0.1, 0.5, 0.1],
        x: [x, x + Math.random() * 20 - 10, x],
        y: [y, y + Math.random() * 20 - 10, y],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: initialDelay,
      }}
    />
  );
};

// Create fragment component
const AsteroidFragment: React.FC<{
  triggerTime: number;
}> = ({ triggerTime }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    if (triggerTime > 0) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      controls.start({
        x: [0, targetX, 0],
        y: [0, targetY, 0],
        rotate: [0, Math.random() * 180 - 90, 0],
        opacity: [0, 0.8, 0],
        scale: [0.1, 0.3 + Math.random() * 0.2, 0.1],
        transition: { 
          duration: 2 + Math.random(),
          times: [0, 0.4, 1],
          ease: "easeInOut"
        }
      });
    }
  }, [triggerTime, controls]);
  
  // Random fragment shape
  const points = Array.from({ length: 6 + Math.floor(Math.random() * 4) }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 10 + Math.random() * 10;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <motion.div
      className="absolute"
      style={{ originX: "center", originY: "center" }}
      animate={controls}
    >
      <svg width="30" height="30" viewBox="-15 -15 30 30">
        <motion.polygon
          points={points}
          className="fill-slate-600"
          style={{
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))"
          }}
        />
      </svg>
    </motion.div>
  );
};

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

// Create spark component
const Spark: React.FC<{
  triggerTime: number;
}> = ({ triggerTime }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    if (triggerTime > 0) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      controls.start({
        x: [0, targetX],
        y: [0, targetY],
        opacity: [1, 0],
        scale: [1, 0],
        transition: { 
          duration: 0.8,
          ease: "easeOut"
        }
      });
    }
  }, [triggerTime, controls]);
  
  return (
    <motion.div
      className="absolute rounded-full bg-amber-300"
      style={{
        width: 3,
        height: 3,
        boxShadow: "0 0 6px 3px rgba(255, 200, 50, 0.7)",
        filter: "blur(0.5px)"
      }}
      initial={{ opacity: 0 }}
      animate={controls}
    />
  );
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
  
  // Fragment ejection state
  const [fragmentTrigger, setFragmentTrigger] = React.useState(0);
  const [sparkTrigger, setSparkTrigger] = React.useState(0);
  
  // Crater states
  const craters = useRef<Array<{
    x: number;
    y: number;
    size: number;
    animation: ReturnType<typeof useAnimation>;
  }>>([]);
  
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
    // Slow continuous rotation
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
    
    // Floating shadow animation
    const shadowAnimation = () => {
      animate(shadowOffsetX, Math.random() * 10 + 10, {
        duration: 7,
        ease: "easeInOut",
        type: "spring",
        stiffness: 20,
        damping: 20,
      });
      
      animate(shadowOffsetY, Math.random() * 10 + 10, {
        duration: 7,
        ease: "easeInOut",
        type: "spring",
        stiffness: 20,
        damping: 20,
      });
    };
    
    shadowAnimation();
    const shadowInterval = setInterval(shadowAnimation, 7000);
    
    // Initialize craters
    const craterCount = 10;
    craters.current = Array.from({ length: craterCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * BASE_RADIUS * 0.7;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = Math.random() * 20 + 10;
      
      return {
        x,
        y,
        size,
        animation: useAnimation(),
      };
    });
    
    // Recurring fragments ejection
    const fragmentInterval = setInterval(() => {
      setFragmentTrigger(prev => prev + 1);
    }, 10000);
    
    // Recurring spark effects
    const sparkInterval = setInterval(() => {
      setSparkTrigger(prev => prev + 1);
    }, 3000);
    
    // Clean up all animations
    return () => {
      clearInterval(wobbleInterval);
      clearInterval(shadowInterval);
      clearInterval(fragmentInterval);
      clearInterval(sparkInterval);
    };
  }, []);
  
  // Animate craters randomly
  useInterval(() => {
    const randomCrater = craters.current[
      Math.floor(Math.random() * craters.current.length)
    ];
    
    if (randomCrater?.animation) {
      randomCrater.animation.start({
        scale: [1, 1.3, 1],
        opacity: [0.8, 1, 0.8],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        },
      });
    }
  }, 2000);
  
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
    
    // Draw craters
    craters.current.forEach(crater => {
      // Draw darker crater base
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
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
      ctx.fillStyle = 'rgba(120, 120, 120, 0.4)';
      ctx.fill();
      
      // Draw crater inner shadow
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
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
  }, [shadowOffsetX, shadowOffsetY]);
  
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
      
      // Trigger several sparks
      setSparkTrigger(prev => prev + 1);
      setTimeout(() => setSparkTrigger(prev => prev + 1), 50);
      setTimeout(() => setSparkTrigger(prev => prev + 1), 100);
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
      
      {/* Dust particles */}
      <div className="absolute w-full h-full pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <DustParticle key={`dust-${i}`} index={i} total={24} radius={180} />
        ))}
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute w-full h-full pointer-events-none flex items-center justify-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <GlowingOrb key={`orb-${i}`} index={i} />
        ))}
      </div>
      
      {/* Flying fragments */}
      <div className="absolute w-full h-full pointer-events-none flex items-center justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <AsteroidFragment key={`fragment-${i}`} triggerTime={fragmentTrigger} />
        ))}
      </div>
      
      {/* Impact sparks */}
      <div className="absolute w-full h-full pointer-events-none flex items-center justify-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <Spark key={`spark-${i}`} triggerTime={sparkTrigger} />
        ))}
      </div>
      
      {/* Background particles */}
      <div className="absolute w-4 h-4 rounded-full bg-white/15 animate-ping"
           style={{ top: '-10%', left: '20%', animationDuration: '3s' }}></div>
      <div className="absolute w-3 h-3 rounded-full bg-white/15 animate-ping"
           style={{ bottom: '10%', right: '-5%', animationDuration: '4s' }}></div>
      <div className="absolute w-2 h-2 rounded-full bg-white/15 animate-ping"
           style={{ top: '30%', right: '-8%', animationDuration: '5s' }}></div>
    </div>
  );
};

export default AnimatedAsteroid;
