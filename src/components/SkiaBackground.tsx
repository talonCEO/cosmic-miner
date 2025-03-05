import React, { useEffect, useRef } from 'react';
import ReactSkiaAdapter from './ReactSkiaAdapter';
import { spaceShader } from '@/utils/shaders';

// Web-compatible implementation using Canvas API
const SkiaBackground: React.FC = () => {
  // Create a fallback canvas implementation for web
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize handler to keep canvas full size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Create particles for stars
    const particles: {x: number, y: number, size: number, speed: number, color: string, opacity: number}[] = [];
    
    for (let i = 0; i < 150; i++) {
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
    
    // Create glow spots for behind UI elements
    const glowPositions = [
      { x: canvas.width * 0.5, y: canvas.height * 0.4, color: 'rgba(102, 51, 204, 0.15)', radius: 100 },
      { x: canvas.width * 0.2, y: canvas.height * 0.2, color: 'rgba(77, 128, 230, 0.1)', radius: 80 },
      { x: canvas.width * 0.8, y: canvas.height * 0.2, color: 'rgba(179, 77, 153, 0.1)', radius: 80 },
    ];
    
    // Animation function
    function draw() {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create space background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a20');
      gradient.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply noise-like effect for nebula
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 0.8;
        const g = Math.random() * 0.5;
        const b = Math.random() * 1;
        ctx.fillStyle = `rgba(${r * 50}, ${g * 20}, ${b * 100}, 0.03)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 10 + 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw particles (stars)
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        // Make stars twinkle
        particle.opacity = Math.max(0.1, particle.opacity + (Math.random() * 0.02 - 0.01));
        
        // Move stars slowly
        particle.y += particle.speed;
        
        if (particle.y > canvas.height) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      // Draw glow effects behind UI elements
      glowPositions.forEach(glow => {
        const radialGradient = ctx.createRadialGradient(
          glow.x, glow.y, 0,
          glow.x, glow.y, glow.radius
        );
        radialGradient.addColorStop(0, glow.color);
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = radialGradient;
        ctx.fillRect(glow.x - glow.radius, glow.y - glow.radius, glow.radius * 2, glow.radius * 2);
      });
      
      // Add volumetric light rays
      const time = Date.now() / 1000;
      
      // Top-right light ray
      ctx.beginPath();
      ctx.moveTo(canvas.width, 0);
      for (let i = 0; i < canvas.height; i += 5) {
        const x = canvas.width - (i * 0.8) - Math.sin(i * 0.01 + time * 0.5) * 20;
        ctx.lineTo(x, i);
      }
      ctx.lineTo(0, canvas.height);
      ctx.lineTo(0, 0);
      ctx.fillStyle = 'rgba(102, 51, 204, 0.05)';
      ctx.fill();
      
      // Bottom-left light ray
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let i = 0; i < canvas.width; i += 5) {
        const y = canvas.height - (i * 0.5) - Math.sin(i * 0.01 + time * 0.3) * 15;
        ctx.lineTo(i, y);
      }
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(0, 0);
      ctx.fillStyle = 'rgba(77, 128, 230, 0.05)';
      ctx.fill();
      
      // Add laser beams
      // Laser beam 1
      ctx.beginPath();
      const beamY1 = (Math.sin(time * 0.5) * 0.5 + 0.5) * canvas.height;
      ctx.moveTo(0, beamY1);
      ctx.lineTo(canvas.width, beamY1);
      ctx.strokeStyle = 'rgba(153, 102, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Laser beam 2
      ctx.beginPath();
      const beamX2 = (Math.sin(time * 0.3 + 1) * 0.5 + 0.5) * canvas.width;
      ctx.moveTo(beamX2, 0);
      ctx.lineTo(beamX2, canvas.height);
      ctx.strokeStyle = 'rgba(102, 204, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Diagonal laser beam
      ctx.beginPath();
      const startX = (Math.sin(time * 0.2) * 0.5 + 0.5) * canvas.width;
      ctx.moveTo(startX, 0);
      ctx.lineTo(canvas.width - startX, canvas.height);
      ctx.strokeStyle = 'rgba(204, 102, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Request next frame
      requestAnimationFrame(draw);
    }
    
    // Start animation
    draw();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <ReactSkiaAdapter>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
        style={{ filter: 'blur(2px)' }}
      />
    </ReactSkiaAdapter>
  );
};

export default SkiaBackground;
