import React, { useEffect, useRef } from 'react';
import { GameProvider } from '@/context/GameContext';
import Header from '@/components/Header';
import ClickArea from '@/components/ClickArea';
import GameTabs from '@/components/GameTabs';
import { Toaster } from "@/components/ui/toaster";
import PowerupsManager from '@/components/PowerupsManager';

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: {x: number, y: number, size: number, speed: number, color: string, opacity: number}[] = [];
    
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 2 + 1;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        speed: Math.random() * 0.3 + 0.1,
        color: '#ffffff',
        opacity: Math.random() * 0.4 + 0.1
      });
    }
    
    function draw() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a20');
      gradient.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        particle.y += particle.speed;
        
        if (particle.y > canvas.height) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      if (Math.random() < 0.01) {
        createShootingStar();
      }
    }
    
    function createShootingStar() {
      const x = Math.random() * canvas.width;
      const y = -20;
      const angle = Math.PI / 4 + Math.random() * 0.5;
      const speed = 2 + Math.random() * 2;
      const size = 2 + Math.random() * 2;
      let trail: {x: number, y: number, size: number, opacity: number}[] = [];
      
      function drawShootingStar() {
        if (!ctx) return;
        
        const newX = x + Math.cos(angle) * currentDistance;
        const newY = y + Math.sin(angle) * currentDistance;
        
        trail.push({
          x: newX,
          y: newY,
          size: size,
          opacity: 0.8
        });
        
        trail.forEach((point, index) => {
          const pointSize = Math.max(0.1, point.size * (1 - index / 10));
          ctx.beginPath();
          ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity * (1 - index / 10)})`;
          ctx.fill();
          
          point.opacity -= 0.05;
        });
        
        trail = trail.filter(point => point.opacity > 0);
        
        currentDistance += speed;
        
        if (newY < canvas.height + size && newX > -size && newX < canvas.width + size && trail.length > 0) {
          requestAnimationFrame(drawShootingStar);
        }
      }
      
      let currentDistance = 0;
      drawShootingStar();
    }
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    function animate() {
      draw();
      requestAnimationFrame(animate);
    }
    
    animate();
    
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
        <SpaceBackground />
        
        <div className="relative z-10">
          <Header />
        </div>
        
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
