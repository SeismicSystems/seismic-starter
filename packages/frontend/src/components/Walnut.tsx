import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface WalnutProps {
  isCracked: boolean;
  isShaking: boolean;
  isHitting: boolean;
}

export default function Walnut({ isCracked, isShaking, isHitting }: WalnutProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isShaking) {
      controls.start({
        rotate: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5 }
      });
    } else if (isHitting) {
      controls.start({
        scale: [1, 0.9, 1.1, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [isShaking, isHitting, controls]);

  return (
    <motion.svg
      width="400"
      height="400"
      viewBox="0 0 200 200"
      animate={controls}
    >
      {/* Walnut shell */}
      <motion.path
        d="M100 20C60 20 20 60 20 100C20 140 60 180 100 180C140 180 180 140 180 100C180 60 140 20 100 20Z"
        fill="#8B4513"
        stroke="#5D3A1A"
        strokeWidth="4"
        animate={isCracked ? { 
          d: [
            "M100 20C60 20 20 60 20 100C20 140 60 180 100 180C140 180 180 140 180 100C180 60 140 20 100 20Z",
            "M100 20C60 20 20 60 20 100C20 140 60 180 100 180C140 180 180 140 180 100C180 60 140 20 100 20Z M100 20L100 180 M60 60L140 140 M60 140L140 60"
          ]
        } : {}}
        transition={{ duration: 0.5 }}
      />
      {/* Walnut texture */}
      <motion.path
        d="M40 100C40 66.8629 66.8629 40 100 40C133.137 40 160 66.8629 160 100C160 133.137 133.137 160 100 160C66.8629 160 40 133.137 40 100Z"
        fill="none"
        stroke="#6B4423"
        strokeWidth="2"
        strokeDasharray="10 5"
        animate={isCracked ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Walnut crack */}
      <motion.path
        d="M100 20C60 20 20 60 20 100C20 140 60 180 100 180"
        fill="none"
        stroke="#5D3A1A"
        strokeWidth="4"
        strokeDasharray="0 1000"
        animate={isCracked ? { strokeDasharray: "1000 1000" } : { strokeDasharray: "0 1000" }}
        transition={{ duration: 0.5 }}
      />
    </motion.svg>
  );
}

