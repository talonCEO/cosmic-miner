import React, { useEffect, useRef, useState } from 'react';

interface PowerupObjectProps {
  type: 'star' | 'orb' | 'cube';
  position: { x: number; y: number };
  onOffScreen: () => void;
  onClick: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const PowerupObject: React.FC<PowerupObjectProps> = ({ type, position, onOffScreen, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [currentY, setCurrentY] = useState(position.y);
  const [isExploding, setIsExploding] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trailParticles, setTrailParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  
  const getColor = () => {
    switch (type) {
      case 'star': return '#FFD700';
      case 'orb': return '#FF4500';
      case 'cube': return '#8A2BE2';
      default: return '#FFFFFF';
    }
  };
  
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      const color = getColor();
      
      setTrailParticles(prev => {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: position.x + Math.random() * 8 - 4,
          y: currentY + Math.random() * 8 - 4,
          size: Math.random() * 4 + 2,
          speedX: 0,
          speedY: 0,
          opacity: 0.7,
          color
        };
        
        const updatedParticles = [...prev, newParticle];
        if (updatedParticles.length > 20) {
          return updatedParticles.slice(-20);
        }
        return updatedParticles;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [currentY, isVisible, position.x]);
  
  useEffect(() => {
    if (trailParticles.length === 0) return;
    
    const interval = setInterval(() => {
      setTrailParticles(prev => 
        prev.map(particle => ({
          ...particle,
          opacity: particle.opacity - 0.05,
          size: particle.size - 0.1
        })).filter(p => p.opacity > 0 && p.size > 0)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [trailParticles]);
  
  useEffect(() => {
    if (isExploding || !isVisible) return;
    
    const moveDown = () => {
      setCurrentY(prev => {
        const newY = prev + 1;
        
        if (newY > window.innerHeight + 50) {
          setIsVisible(false);
          onOffScreen();
        }
        
        return newY;
      });
    };
    
    let interval;
    switch (type) {
      case 'star':
        interval = setInterval(moveDown, 40);
        break;
      case 'orb':
        interval = setInterval(moveDown, 35);
        break;
      case 'cube':
        interval = setInterval(moveDown, 45);
        break;
      default:
        interval = setInterval(moveDown, 40);
    }
    
    return () => clearInterval(interval);
  }, [type, onOffScreen, isExploding, isVisible]);
  
  const createExplosion = () => {
    const particleCount = 30;
    const color = getColor();
    const centerX = position.x;
    const centerY = currentY;
    
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 5 + Math.random() * 7;
      
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        size: Math.random() * 6 + 2,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: 1,
        color
      });
    }
    
    setParticles(newParticles);
  };
  
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY,
          opacity: particle.opacity - 0.02,
          size: particle.size - 0.1,
          speedY: particle.speedY + 0.1
        })).filter(p => {
          return p.opacity > 0 && 
                 p.size > 0 &&
                 p.x > 0 && 
                 p.x < window.innerWidth &&
                 p.y > 0 && 
                 p.y < window.innerHeight;
        })
      );
    }, 20);
    
    return () => clearInterval(interval);
  }, [particles]);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExploding(true);
    setIsVisible(false);
    createExplosion();
    onClick();
  };
  
  const renderTrail = () => {
    return trailParticles.map(particle => (
      <div
        key={particle.id}
        className="absolute rounded-full"
        style={{
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity: particle.opacity,
          filter: `blur(${particle.size / 3}px)`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    ));
  };
  
  const renderExplosion = () => {
    return particles.map(particle => (
      <div
        key={particle.id}
        className="absolute rounded-full"
        style={{
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity: particle.opacity,
          filter: `blur(${particle.size / 4}px)`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    ));
  };
  
  const renderPowerup = () => {
    const scale = 0.25;
    
    switch (type) {
      case 'star':
        return (
          <div 
            className="absolute flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              left: position.x,
              top: currentY,
              width: 16 * scale,
              height: 16 * scale,
              zIndex: 50,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 100, 0.8))',
              willChange: 'top',
              transform: `translate(-50%, -50%) scale(${scale})`
            }}
            ref={ref}
            onClick={handleClick}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                fill="#FFD700" 
                stroke="#FFF" 
                strokeWidth="0.5"
              />
            </svg>
            <div className="absolute inset-0 rounded-full opacity-20 animate-pulse" 
                 style={{ backgroundColor: '#FFD700' }}></div>
          </div>
        );
        
      case 'orb':
        return (
          <div 
            className="absolute flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              left: position.x,
              top: currentY,
              width: 16 * scale,
              height: 16 * scale,
              zIndex: 50,
              willChange: 'top',
              transform: `translate(-50%, -50%) scale(${scale})`
            }}
            ref={ref}
            onClick={handleClick}
          >
            <div className="absolute w-12 h-12 rounded-full bg-red-600 animate-pulse"></div>
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-800 opacity-80"></div>
            <div className="absolute w-4 h-4 rounded-full bg-white opacity-80 blur-[2px]" 
                 style={{ top: '30%', left: '30%' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-spin" 
                 style={{ animationDuration: '8s' }}></div>
          </div>
        );
        
      case 'cube':
        return (
          <div 
            className="absolute flex items-center justify-center cursor-pointer pointer-events-auto perspective-800"
            style={{
              left: position.x,
              top: currentY,
              width: 16 * scale,
              height: 16 * scale,
              zIndex: 50,
              willChange: 'top',
              transform: `translate(-50%, -50%) scale(${scale})`
            }}
            ref={ref}
            onClick={handleClick}
          >
            <div className="w-12 h-12 relative animate-spin" style={{ transformStyle: 'preserve-3d', animationDuration: '12s' }}>
              <div className="absolute w-full h-full bg-purple-600 opacity-80" 
                   style={{ transform: 'translateZ(6px)' }}></div>
              <div className="absolute w-full h-full bg-purple-800 opacity-80" 
                   style={{ transform: 'rotateY(180deg) translateZ(6px)' }}></div>
              <div className="absolute w-full h-full bg-purple-700 opacity-80" 
                   style={{ transform: 'rotateY(90deg) translateZ(6px)' }}></div>
              <div className="absolute w-full h-full bg-purple-500 opacity-80" 
                   style={{ transform: 'rotateY(-90deg) translateZ(6px)' }}></div>
              <div className="absolute w-full h-full bg-purple-400 opacity-80" 
                   style={{ transform: 'rotateX(90deg) translateZ(6px)' }}></div>
              <div className="absolute w-full h-full bg-purple-900 opacity-80" 
                   style={{ transform: 'rotateX(-90deg) translateZ(6px)' }}></div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      {renderTrail()}
      {renderExplosion()}
      {isVisible && renderPowerup()}
    </>
  );
};

export default PowerupObject;
