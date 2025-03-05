
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';

interface AnimatedAsteroidProps {
  onClick: () => void;
  isAnimating: boolean;
}

const AnimatedAsteroid: React.FC<AnimatedAsteroidProps> = ({ onClick, isAnimating }) => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Stable rotation animation
  useEffect(() => {
    const rotationSpeed = 0.1; // Very slow rotation speed
    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      
      // Update rotation at a consistent, slow pace
      // Only update every 50ms to further slow and stabilize
      if (deltaTime > 50) {
        setRotation(prevRotation => (prevRotation + rotationSpeed) % 360);
        lastTime = time;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  // Handle animation
  useEffect(() => {
    // Create asteroid rendering
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 256;
    canvas.height = 256;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context for transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // 1. Draw the basic asteroid shape - irregular polygon
    const asteroidRadius = 100;
    const points = 12; // Number of vertices
    const variance = 0.3; // How jagged the asteroid is (0-1)
    
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const jitter = 1 - Math.random() * variance;
      const x = Math.cos(angle) * asteroidRadius * jitter;
      const y = Math.sin(angle) * asteroidRadius * jitter;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    
    // 4. Create shadow effect for 3D appearance
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    
    // 2. Apply radial gradient for the asteroid body and glow
    const gradient = ctx.createRadialGradient(
      -asteroidRadius * 0.3, -asteroidRadius * 0.3, 0,
      0, 0, asteroidRadius * 1.3
    );
    gradient.addColorStop(0, '#a0a0a0');  // Lighter gray where light hits
    gradient.addColorStop(0.7, '#606060'); // Medium gray for main body
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0)'); // Transparent edge for glow
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Remove shadow for craters
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 3. Add crater textures
    const craterCount = 12;
    for (let i = 0; i < craterCount; i++) {
      // Random position within the asteroid
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * asteroidRadius * 0.7; // Keep craters inside
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      // Random crater size
      const craterSize = Math.random() * 15 + 5;
      
      // Draw crater (darker circle)
      ctx.beginPath();
      ctx.arc(x, y, craterSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
      ctx.fill();
      
      // Add highlight to one edge of crater for 3D effect
      ctx.beginPath();
      ctx.arc(x - craterSize * 0.2, y - craterSize * 0.2, craterSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.fill();
    }
    
    // Draw a subtle noise texture over the asteroid
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * asteroidRadius;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      // Check if point is inside asteroid shape
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, 0.1)`;
      ctx.fill();
    }
    
    // Restore context
    ctx.restore();
  }, [rotation]); // Only redraw when rotation changes
  
  // Handle click animation
  useEffect(() => {
    if (isAnimating) {
      setScale(0.95);
      const timeout = setTimeout(() => {
        setScale(1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);
  
  return (
    <div className="w-full h-full relative">
      {/* Outer glow effect using CSS */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, transparent 30%, rgba(180, 180, 220, 0.3) 70%, transparent 100%)',
          animation: 'pulse-opacity 4s infinite alternate',
          transform: `scale(${scale * 1.05})`,
          transition: 'transform 0.15s ease-out',
        }}
      ></div>
      
      {/* Canvas for drawing the asteroid */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-pointer" 
        onClick={onClick}
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.15s ease-out',
        }}
      />
      
      {/* Small floating particles around the asteroid */}
      <div className="absolute w-4 h-4 rounded-full bg-white/20 animate-ping"
           style={{ top: '-10%', left: '20%', animationDuration: '3s' }}></div>
      <div className="absolute w-3 h-3 rounded-full bg-white/20 animate-ping"
           style={{ bottom: '10%', right: '-5%', animationDuration: '4s' }}></div>
      <div className="absolute w-2 h-2 rounded-full bg-white/20 animate-ping"
           style={{ top: '30%', right: '-8%', animationDuration: '5s' }}></div>
    </div>
  );
};

export default AnimatedAsteroid;
