import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ShakeWrapperProps {
  children: React.ReactNode;
  isShaking: boolean;
}

const ShakeWrapper: React.FC<ShakeWrapperProps> = ({ children, isShaking }) => {
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const shakeTransform = useTransform(
    [shakeX, shakeY],
    ([x, y]) => `translate(${x}px, ${y}px)`
  );

  useEffect(() => {
    if (isShaking) {
      // Subtle shake: smaller amplitude, shorter duration
      animate(shakeX, [0, -3, 3, -2, 2, 0], {
        duration: 0.25,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: "easeInOut",
      });
      animate(shakeY, [0, -2, 2, -1, 1, 0], {
        duration: 0.25,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: "easeInOut",
        onComplete: () => {
          shakeX.set(0);
          shakeY.set(0);
        },
      });
    }
  }, [isShaking, shakeX, shakeY]);

  return (
    <motion.div style={{ transform: shakeTransform }}>
      {children}
    </motion.div>
  );
};

export default ShakeWrapper;