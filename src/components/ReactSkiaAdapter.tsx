
import React, { useRef } from 'react';

// This adapter component creates a container for our canvas-based effects
const ReactSkiaAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      {children}
    </div>
  );
};

export default ReactSkiaAdapter;
