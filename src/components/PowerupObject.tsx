
import React, { useEffect, useRef } from 'react';

interface PowerupObjectProps {
  type: 'star' | 'orb' | 'cube';
  position: { x: number; y: number };
  onOffScreen: () => void;
  onClick: () => void;
}

const PowerupObject: React.FC<PowerupObjectProps> = ({ type, position, onOffScreen, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkIfOffScreen = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          onOffScreen();
        }
      }
    };
    
    const interval = setInterval(checkIfOffScreen, 1000);
    return () => clearInterval(interval);
  }, [onOffScreen]);
  
  const renderPowerup = () => {
    switch (type) {
      case 'star':
        return (
          <div 
            className="w-12 h-12 absolute flex items-center justify-center cursor-pointer animate-pulse"
            style={{
              left: position.x,
              top: position.y,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 100, 0.8))',
              transition: 'top 40s linear',
              willChange: 'top'
            }}
            ref={ref}
            onClick={onClick}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                fill="#FFD700" 
                stroke="#FFF" 
                strokeWidth="0.5"
              />
            </svg>
            <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
          </div>
        );
        
      case 'orb':
        return (
          <div 
            className="w-14 h-14 absolute flex items-center justify-center cursor-pointer"
            style={{
              left: position.x,
              top: position.y,
              transition: 'top 35s linear',
              willChange: 'top'
            }}
            ref={ref}
            onClick={onClick}
          >
            <div className="absolute w-10 h-10 rounded-full bg-red-600 animate-pulse"></div>
            <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-800 opacity-80"></div>
            <div className="absolute w-3 h-3 rounded-full bg-white opacity-80 blur-[2px]" 
                 style={{ top: '30%', left: '30%' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-spin" 
                 style={{ animationDuration: '8s' }}></div>
          </div>
        );
        
      case 'cube':
        return (
          <div 
            className="w-16 h-16 absolute flex items-center justify-center cursor-pointer perspective-[800px]"
            style={{
              left: position.x,
              top: position.y,
              transition: 'top 45s linear',
              willChange: 'top'
            }}
            ref={ref}
            onClick={onClick}
          >
            <div className="w-10 h-10 relative animate-spin" style={{ transformStyle: 'preserve-3d', animationDuration: '12s' }}>
              {/* Front face */}
              <div className="absolute w-full h-full bg-purple-600 opacity-80" 
                   style={{ transform: 'translateZ(5px)' }}></div>
              {/* Back face */}
              <div className="absolute w-full h-full bg-purple-800 opacity-80" 
                   style={{ transform: 'rotateY(180deg) translateZ(5px)' }}></div>
              {/* Right face */}
              <div className="absolute w-full h-full bg-purple-700 opacity-80" 
                   style={{ transform: 'rotateY(90deg) translateZ(5px)' }}></div>
              {/* Left face */}
              <div className="absolute w-full h-full bg-purple-500 opacity-80" 
                   style={{ transform: 'rotateY(-90deg) translateZ(5px)' }}></div>
              {/* Top face */}
              <div className="absolute w-full h-full bg-purple-400 opacity-80" 
                   style={{ transform: 'rotateX(90deg) translateZ(5px)' }}></div>
              {/* Bottom face */}
              <div className="absolute w-full h-full bg-purple-900 opacity-80" 
                   style={{ transform: 'rotateX(-90deg) translateZ(5px)' }}></div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return renderPowerup();
};

export default PowerupObject;
