
import React, { useEffect, useRef, useState } from 'react';
import { Mountain } from 'lucide-react';

interface ShootingStarProps {
  onComplete: () => void;
  id: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ onComplete, id }) => {
  const starRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  
  // Generate random starting position and direction on mount
  useEffect(() => {
    // Determine which edge to start from (top, right, left, bottom)
    const startEdge = Math.floor(Math.random() * 4);
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    
    // Position off-screen based on the randomly chosen edge
    switch (startEdge) {
      case 0: // top
        x = Math.random() * windowWidth;
        y = -50;
        dx = Math.random() * 2 - 1;
        dy = Math.random() * 2 + 1;
        break;
      case 1: // right
        x = windowWidth + 50;
        y = Math.random() * windowHeight;
        dx = -(Math.random() * 2 + 1);
        dy = Math.random() * 2 - 1;
        break;
      case 2: // bottom
        x = Math.random() * windowWidth;
        y = windowHeight + 50;
        dx = Math.random() * 2 - 1;
        dy = -(Math.random() * 2 + 1);
        break;
      case 3: // left
        x = -50;
        y = Math.random() * windowHeight;
        dx = Math.random() * 2 + 1;
        dy = Math.random() * 2 - 1;
        break;
    }
    
    // Normalize direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    // Apply random velocity reduction (20-33% of current value)
    const velocityFactor = 0.2 + (Math.random() * 0.13); // Between 20% and 33%
    dx = (dx / magnitude) * velocityFactor * 5; // Scale speed
    dy = (dy / magnitude) * velocityFactor * 5;
    
    setPosition({ x, y });
    setDirection({ x: dx, y: dy });
    
    // Remove star after 10 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  // Slowly rotate the star
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  // Move the star according to its direction
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => ({
        x: prev.x + direction.x,
        y: prev.y + direction.y
      }));
    }, 16); // ~60fps
    
    return () => clearInterval(moveInterval);
  }, [direction]);
  
  return (
    <div 
      ref={starRef}
      className="absolute z-0 rounded-full"
      style={{
        width: '25px',
        height: '25px',
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: 'transform 0.05s linear',
        background: `radial-gradient(circle at 30% 30%, #8E9196, #403E43)`,
        boxShadow: `0 0 10px 2px rgba(142, 145, 150, 0.5)`,
        opacity: '0.9',
        animation: 'pulse-opacity 2s infinite alternate',
      }}
    >
      {/* Star texture overlay */}
      <div 
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 20%, transparent 0%, #00000070 80%)',
          mixBlendMode: 'multiply',
        }}
      ></div>
      
      {/* Small craters */}
      <div 
        className="absolute w-1 h-1 rounded-full bg-black opacity-20" 
        style={{ top: '20%', left: '30%' }}
      ></div>
      <div 
        className="absolute w-1 h-1 rounded-full bg-black opacity-20" 
        style={{ top: '60%', left: '60%' }}
      ></div>
      
      {/* Mountain icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <Mountain className="w-4 h-4 text-white" />
      </div>
      
      {/* Trail effect */}
      <div className="absolute w-20 h-2 bg-gradient-to-r from-white/50 to-transparent"
           style={{ 
             top: '45%', 
             right: '90%',
             transform: `rotate(${rotation}deg)` 
           }}></div>
           
      {/* Particle effects */}
      <div className="particle-container">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/70 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ShootingStar;
