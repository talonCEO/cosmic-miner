
import { useWindowDimensions } from 'react-native';
import { useValue, useLoop, useSharedValueEffect, mix } from '@shopify/react-native-skia';

export const useSkiaAnimation = () => {
  const { width, height } = useWindowDimensions();
  const time = useValue(0);
  const loop = useLoop();
  
  // Animation values
  const pulseValue = useValue(1);
  const floatValue = useValue(0);
  
  // Update animations
  useSharedValueEffect(() => {
    time.current = loop.current;
    pulseValue.current = mix(pulseValue.current, 1 + 0.1 * Math.sin(loop.current * 2), 0.1);
    floatValue.current = 0.5 * Math.sin(loop.current * 0.5) + 0.5;
  }, [loop]);
  
  return {
    dimensions: { width, height },
    time,
    loop,
    pulseValue,
    floatValue
  };
};

export default useSkiaAnimation;
