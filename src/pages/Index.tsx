
import React, { useEffect, useRef } from 'react';
import { GameProvider } from '@/context/GameContext';
import Header from '@/components/Header';
import ClickArea from '@/components/ClickArea';
import GameTabs from '@/components/GameTabs';
import { Toaster } from "@/components/ui/toaster";
import PowerupsManager from '@/components/PowerupsManager';

// Simplified space background with subtle particle effects
const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create particles
    const particles: {x: number, y: number, size: number, speed: number, color: string, opacity: number}[] = [];
    
    // Create 50 subtle particles
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 2 + 1;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        speed: Math.random() * 0.3 + 0.1,
        color: '#ffffff',
        opacity: Math.random() * 0.4 + 0.1 // Very subtle opacity
      });
    }
    
    // Draw background and particles
    function draw() {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a20');
      gradient.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        // Move particle
        particle.y += particle.speed;
        
        // Wrap around when particle goes off screen
        if (particle.y > canvas.height) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      // Occasionally shoot a particle across the screen
      if (Math.random() < 0.01) {
        createShootingStar();
      }
    }
    
    // Create a shooting star that moves across the screen
    function createShootingStar() {
      const x = Math.random() * canvas.width;
      const y = -20;
      const angle = Math.PI / 4 + Math.random() * 0.5; // Downward angle
      const speed = 2 + Math.random() * 2;
      const size = 2 + Math.random() * 2;
      // Changed from const to let since we need to reassign it later
      let trail: {x: number, y: number, size: number, opacity: number}[] = [];
      
      function drawShootingStar() {
        if (!ctx) return;
        
        // Calculate current position
        const newX = x + Math.cos(angle) * currentDistance;
        const newY = y + Math.sin(angle) * currentDistance;
        
        // Add current position to trail
        trail.push({
          x: newX,
          y: newY,
          size: size,
          opacity: 0.8
        });
        
        // Draw trail
        trail.forEach((point, index) => {
          // Fix: Ensure the point size is always positive
          const pointSize = Math.max(0.1, point.size * (1 - index / 10));
          ctx.beginPath();
          ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity * (1 - index / 10)})`;
          ctx.fill();
          
          // Fade trail points
          point.opacity -= 0.05;
        });
        
        // Remove old trail points
        trail = trail.filter(point => point.opacity > 0);
        
        // Move shooting star
        currentDistance += speed;
        
        // Continue animation until shooting star is off screen
        if (newY < canvas.height + size && newX > -size && newX < canvas.width + size && trail.length > 0) {
          requestAnimationFrame(drawShootingStar);
        }
      }
      
      let currentDistance = 0;
      drawShootingStar();
    }
    
    // Set canvas dimensions to match window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    
    // Animation loop
    function animate() {
      draw();
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-0"
    />
  );
};

const Index: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col overflow-hidden relative">
        {/* Space background with subtle effects */}
        <SpaceBackground />
        
        {/* Header with glass effect for depth */}
        <div className="relative z-10">
          <Header />
        </div>
        
        {/* Powerups Manager */}
        <PowerupsManager />
        
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 relative z-10">
          <div className="py-4">
            <ClickArea />
            <div className="backdrop-blur-sm bg-opacity-20 bg-slate-900 rounded-xl p-4 shadow-2xl border border-indigo-500/20">
              <GameTabs />
            </div>
          </div>
        </main>
        
        <footer className="py-4 text-center text-sm text-slate-300 relative z-10 backdrop-blur-sm">
          <p>Mine elements from asteroids across the galaxy! Discover all 50 rare elements!</p>
          <p className="text-xs mt-1">Auto-buy: purchases the cheapest available upgrade automatically</p>
        </footer>
        
        <Toaster />
      </div>
    </GameProvider>
  );
};

export default Index;
