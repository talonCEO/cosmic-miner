
import React, { useEffect, useRef, useState } from 'react';

interface PowerupObjectProps {
  type: 'star' | 'orb' | 'cube';
  position: { x: number; y: number };
  onOffScreen: () => void;
  onClick: () => void;
}

const PowerupObject: React.FC<PowerupObjectProps> = ({ type, position, onOffScreen, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [currentY, setCurrentY] = useState(position.y);
  
  // Handle vertical movement
  useEffect(() => {
    const moveDown = () => {
      setCurrentY(prev => {
        const newY = prev + 1; // Move 1px at a time
        
        // Check if off screen
        if (newY > window.innerHeight + 100) {
          onOffScreen();
        }
        
        return newY;
      });
    };
    
    // Move at different speeds based on type
    let interval;
    switch (type) {
      case 'star':
        interval = setInterval(moveDown, 40); // Faster
        break;
      case 'orb':
        interval = setInterval(moveDown, 35); // Medium
        break;
      case 'cube':
        interval = setInterval(moveDown, 45); // Slower
        break;
      default:
        interval = setInterval(moveDown, 40);
    }
    
    return () => clearInterval(interval);
  }, [type, onOffScreen]);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };
  
  const renderPowerup = () => {
    switch (type) {
      case 'star':
        return (
          <div 
            className="w-16 h-16 absolute flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              left: position.x,
              top: currentY,
              zIndex: 50,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 100, 0.8))',
              willChange: 'top'
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
            className="w-16 h-16 absolute flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              left: position.x,
              top: currentY,
              zIndex: 50,
              willChange: 'top'
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
            className="w-16 h-16 absolute flex items-center justify-center cursor-pointer pointer-events-auto perspective-800"
            style={{
              left: position.x,
              top: currentY,
              zIndex: 50,
              willChange: 'top'
            }}
            ref={ref}
            onClick={handleClick}
          >
            <div className="w-12 h-12 relative animate-spin" style={{ transformStyle: 'preserve-3d', animationDuration: '12s' }}>
              {/* Front face */}
              <div className="absolute w-full h-full bg-purple-600 opacity-80" 
                   style={{ transform: 'translateZ(6px)' }}></div>
              {/* Back face */}
              <div className="absolute w-full h-full bg-purple-800 opacity-80" 
                   style={{ transform: 'rotateY(180deg) translateZ(6px)' }}></div>
              {/* Right face */}
              <div className="absolute w-full h-full bg-purple-700 opacity-80" 
                   style={{ transform: 'rotateY(90deg) translateZ(6px)' }}></div>
              {/* Left face */}
              <div className="absolute w-full h-full bg-purple-500 opacity-80" 
                   style={{ transform: 'rotateY(-90deg) translateZ(6px)' }}></div>
              {/* Top face */}
              <div className="absolute w-full h-full bg-purple-400 opacity-80" 
                   style={{ transform: 'rotateX(90deg) translateZ(6px)' }}></div>
              {/* Bottom face */}
              <div className="absolute w-full h-full bg-purple-900 opacity-80" 
                   style={{ transform: 'rotateX(-90deg) translateZ(6px)' }}></div>
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
