
import React from 'react';
import {
  Canvas,
  Fill,
  Shader,
  useLoop,
  useSharedValueEffect,
  useValue,
  vec,
  BlurMask,
  Group,
  mix
} from '@shopify/react-native-skia';
import { spaceShader, laserBeamShader, glowShader } from '@/utils/shaders';
import ReactSkiaAdapter from './ReactSkiaAdapter';

// Fallback Canvas using regular HTML Canvas for web compatibility
const FallbackSpaceCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    
    function draw() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
        
        particle.y += particle.speed;
        
        if (particle.y > canvas.height) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      // Add glow effects
      const glowPositions = [
        { x: canvas.width * 0.5, y: canvas.height * 0.4, color: 'rgba(102, 51, 204, 0.15)', radius: 100 },
        { x: canvas.width * 0.2, y: canvas.height * 0.2, color: 'rgba(77, 128, 230, 0.1)', radius: 80 },
        { x: canvas.width * 0.8, y: canvas.height * 0.2, color: 'rgba(179, 77, 153, 0.1)', radius: 80 },
      ];
      
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
      
      // Add laser beams
      const time = Date.now() / 1000;
      
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
    }
    
    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      particles.length = 0;
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
    }
    
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

const SkiaBackground: React.FC = () => {
  // Check if we can use Skia (would be true in a proper React Native environment)
  // For web, we'll fall back to our canvas implementation
  const canUseSkia = false;
  
  if (!canUseSkia) {
    return <FallbackSpaceCanvas />;
  }
  
  // This part would only run in an actual React Native environment with Skia
  const width = window.innerWidth;
  const height = window.innerHeight;
  const time = useValue(0);
  const loop = useLoop();
  
  // Animation for the pulse effect
  const pulseAnim = useValue(1);
  
  // Prepare glow positions (around where key elements will be)
  const glowPositions = [
    { x: 0.5, y: 0.4, color: [0.4, 0.2, 0.8], intensity: 0.8 },  // Center (click area)
    { x: 0.2, y: 0.2, color: [0.3, 0.5, 0.9], intensity: 0.5 },  // Top left
    { x: 0.8, y: 0.2, color: [0.7, 0.3, 0.6], intensity: 0.5 },  // Top right
    { x: 0.3, y: 0.7, color: [0.2, 0.6, 0.7], intensity: 0.4 },  // Bottom left
    { x: 0.7, y: 0.7, color: [0.6, 0.2, 0.5], intensity: 0.4 },  // Bottom right
  ];
  
  // Update animations
  useSharedValueEffect(() => {
    time.current = loop.current;
    pulseAnim.current = mix(pulseAnim.current, 1 + 0.1 * Math.sin(loop.current * 2), 0.1);
  }, [loop]);
  
  return (
    <ReactSkiaAdapter>
      <Canvas style={{ position: 'absolute', width, height }}>
        {/* Main space background with volumetric lighting */}
        <Fill>
          <Shader
            source={spaceShader}
            uniforms={{
              u_resolution: vec(width, height),
              u_time: time
            }}
          />
          <BlurMask blur={2} style="solid" />
        </Fill>
        
        {/* Laser beams layer */}
        <Fill>
          <Shader
            source={laserBeamShader}
            uniforms={{
              u_resolution: vec(width, height),
              u_time: time
            }}
          />
        </Fill>
        
        {/* Glow effects layer - positioned behind key UI elements */}
        <Group>
          {glowPositions.map((glow, index) => (
            <Fill key={index}>
              <Shader
                source={glowShader}
                uniforms={{
                  u_resolution: vec(width, height),
                  u_time: time,
                  u_color: vec(glow.color[0], glow.color[1], glow.color[2]),
                  u_position: vec(glow.x, glow.y),
                  u_intensity: glow.intensity * pulseAnim.current
                }}
              />
            </Fill>
          ))}
        </Group>
      </Canvas>
    </ReactSkiaAdapter>
  );
};

export default SkiaBackground;
