
import React, { useEffect, useRef } from 'react';
import { GameProvider } from '@/context/GameContext';
import Header from '@/components/Header';
import ClickArea from '@/components/ClickArea';
import GameTabs from '@/components/GameTabs';
import { Toaster } from "@/components/ui/toaster";

// Cosmic background elements like stars and asteroids
const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Redraw stars on resize
      drawStars();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    
    // Create stars
    const stars: {x: number, y: number, radius: number, opacity: number, speed: number}[] = [];
    const asteroids: {x: number, y: number, radius: number, speed: number, rotation: number, rotationSpeed: number}[] = [];
    
    // Create 200 stars with different properties
    for (let i = 0; i < 200; i++) {
      const radius = Math.random() * 2;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        opacity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
        speed: (Math.random() * 0.05) + 0.01
      });
    }
    
    // Create 5 distant asteroids
    for (let i = 0; i < 5; i++) {
      asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1, // Small distant asteroids
        speed: (Math.random() * 0.2) + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.02) - 0.01
      });
    }
    
    // Draw stars on canvas
    function drawStars() {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a20');
      gradient.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Move star
        star.y += star.speed;
        
        // Wrap around when star goes off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      // Draw asteroids
      asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        
        // Draw asteroid as an irregular shape
        ctx.beginPath();
        ctx.moveTo(asteroid.radius, 0);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const randomRadius = asteroid.radius * (0.8 + Math.random() * 0.4);
          const x = Math.cos(angle) * randomRadius;
          const y = Math.sin(angle) * randomRadius;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = '#a0a0a0';
        ctx.fill();
        
        ctx.restore();
        
        // Move and rotate asteroid
        asteroid.y += asteroid.speed;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Wrap around when asteroid goes off screen
        if (asteroid.y > canvas.height) {
          asteroid.y = -asteroid.radius * 2;
          asteroid.x = Math.random() * canvas.width;
        }
      });
      
      // Occasionally shoot a comet
      if (Math.random() < 0.002) {
        createComet();
      }
    }
    
    // Create a comet that shoots across the screen
    function createComet() {
      const startX = Math.random() * canvas.width;
      const startY = -20;
      const angle = (Math.PI / 4) + (Math.random() * Math.PI / 2); // Downward angle
      const speed = 5 + Math.random() * 5;
      const length = 30 + Math.random() * 50;
      
      function drawComet() {
        if (!ctx || !canvas) return;
        
        // Calculate current position
        const x = startX + Math.cos(angle) * currentDistance;
        const y = startY + Math.sin(angle) * currentDistance;
        
        // Draw comet head
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Draw comet tail
        const gradient = ctx.createLinearGradient(
          x, y,
          x - Math.cos(angle) * length, y - Math.sin(angle) * length
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - Math.cos(angle - 0.1) * length,
          y - Math.sin(angle - 0.1) * length
        );
        ctx.lineTo(
          x - Math.cos(angle + 0.1) * length,
          y - Math.sin(angle + 0.1) * length
        );
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Move comet
        currentDistance += speed;
        
        // Continue animation until comet is off screen
        if (y < canvas.height + length && x > -length && x < canvas.width + length) {
          requestAnimationFrame(drawComet);
        }
      }
      
      let currentDistance = 0;
      drawComet();
    }
    
    // Animation loop
    function animate() {
      drawStars();
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
        {/* Space background with stars and effects */}
        <SpaceBackground />
        
        {/* Header with glass effect for depth */}
        <div className="relative z-10">
          <Header />
        </div>
        
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
