
import React, { useEffect, useRef } from 'react';

// This adapter component bridges React Native Skia with React for web
const ReactSkiaAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup mock React Native environment for Skia
    if (typeof window !== 'undefined') {
      // @ts-ignore - We're setting up a mock React Native environment
      window.ReactNativeWebView = {
        postMessage: (msg: string) => console.log('ReactNativeWebView mock:', msg)
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      {children}
    </div>
  );
};

export default ReactSkiaAdapter;
