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
  
  // Slower rotation animation (15% of original speed)
  useEffect(() => {
    const originalSpeed = 0.001;
    const rotationSpeed = originalSpeed * 0.15; // 15% of original speed
    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      
      if (deltaTime > 50) {
        setRotation(prev => (prev + rotationSpeed) % 360);
        lastTime = time;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  // Asteroid rendering with improvements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 350;
    canvas.height = 350;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw irregular asteroid shape
    const asteroidRadius = 150;
    const points = 12;
    const variance = 0.25; // Slightly increased for more irregularity
    
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const jitter = 1 - Math.random() * variance;
      const x = Math.cos(angle) * asteroidRadius * jitter;
      const y = Math.sin(angle) * asteroidRadius * jitter;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // Enhanced shadow for better 3D effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 15;
    ctx.shadowOffsetY = 15;
    
    // Improved gradient with more natural lighting
    const gradient = ctx.createRadialGradient(
      -asteroidRadius * 0.4, -asteroidRadius * 0.4, 0, // Shifted light source
      0, 0, asteroidRadius * 1.2
    );
    gradient.addColorStop(0, '#b0b0b0');    // Slightly lighter highlight
    gradient.addColorStop(0.4, '#808080');   // Mid-tone transition
    gradient.addColorStop(0.8, '#404040');   // Darker base
    gradient.addColorStop(1, 'rgba(30, 30, 30, 0)'); // Softer edge
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Crater generation with overlap prevention
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    const craterCount = 8;
    const craters: { x: number; y: number; size: number }[] = [];
    
    for (let i = 0; i < craterCount; i++) {
      let attempts = 0;
      const maxAttempts = 20;
      let craterPlaced = false;
      
      while (!craterPlaced && attempts < maxAttempts) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * asteroidRadius * 0.7;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const craterSize = Math.random() * 20 + 8; // Slightly larger range
        
        // Check for overlap with existing craters
        const overlaps = craters.some(crater => {
          const dx = crater.x - x;
          const dy = crater.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < (crater.size + craterSize) * 0.8; // 20% buffer
        });
        
        if (!overlaps) {
          craters.push({ x, y, size: craterSize });
          craterPlaced = true;
          
          // Draw crater with improved depth
          ctx.beginPath();
          ctx.arc(x, y, craterSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
          ctx.fill();
          
          // Enhanced 3D highlight
          ctx.beginPath();
          ctx.arc(
            x - craterSize * 0.3,
            y - craterSize * 0.3,
            craterSize * 0.7,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = 'rgba(120, 120, 120, 0.4)';
          ctx.fill();
          
          // Add subtle inner shadow
          ctx.beginPath();
          ctx.arc(x, y, craterSize * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fill();
        }
        attempts++;
      }
    }
    
    // Improved noise texture with more natural distribution
    for (let i = 0; i < 300; i++) { // Reduced count for performance
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * asteroidRadius; // More even distribution
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() * 80 + 40}, ${Math.random() * 80 + 40}, ${Math.random() * 80 + 40}, 0.15)`;
      ctx.fill();
    }
    
    ctx.restore();
  }, [rotation]);
  
  useEffect(() => {
    if (isAnimating) {
      setScale(0.95);
      const timeout = setTimeout(() => setScale(1), 150);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);
  
  return (
    <div className="w-full h-full relative">
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, transparent 30%, rgba(180, 180, 220, 0.25) 70%, transparent 100%)',
          animation: 'pulse-opacity 4s infinite alternate',
          transform: `scale(${scale * 1.05})`,
          transition: 'transform 0.15s ease-out',
        }}
      ></div>
      
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-pointer" 
        onClick={onClick}
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.15s ease-out',
        }}
      />
      
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
