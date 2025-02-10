import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useGetWalnutContract, useWalnutHit, useWalnutShake } from '../hooks/useWalnutContract'

interface WalnutProps {
  isCracked: boolean;
  isShakingAnimation: boolean;
  isHittingAnimation: boolean;
}

export default function Walnut({ isCracked, isShakingAnimation, isHittingAnimation }: WalnutProps) {
  const controls = useAnimation();
  const { contract: walnutContract } = useGetWalnutContract()

  useEffect(() => {
    if (isShakingAnimation) {
      controls.start({
        rotate: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5 }
      });
    } else if (isHittingAnimation) {
      controls.start({
        scale: [1, 0.9, 1.1, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [isShakingAnimation, isHittingAnimation, controls]);

  const handleHit = async () => {
    try {
      await walnutContract?.write.hit([], { gas: 100000 })
    } catch (error) {
      console.error('Error hitting walnut:', error)
    }
  }

  const handleShake = async () => {
    try {
      await walnutContract?.write.shake([1], { gas: 100000 })
    } catch (error) {
      console.error('Error shaking walnut:', error)
    }
  }


  const handleLook = async () => {
    try {
      const result = await walnutContract?.read.look()
      console.log('result', result)
    } catch (error) {
      console.error('Error looking at walnut:', error)
    }
  }

  return (
    <div className="relative">
      <motion.div
        animate={controls}
        className="relative w-48 h-48"
      >
        {/* Walnut Shell */}
        <motion.div
          className={`absolute inset-0 ${isCracked ? 'opacity-50' : 'opacity-100'}`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Main walnut shape */}
            <path
              d="M50 10 
                 C 70 10, 90 30, 90 50
                 C 90 70, 70 90, 50 90
                 C 30 90, 10 70, 10 50
                 C 10 30, 30 10, 50 10"
              fill="#8B4513"
              stroke="#654321"
              strokeWidth="2"
            />
            {/* Texture lines */}
            <path
              d="M30 40 Q 50 35, 70 40
                 M25 50 Q 50 45, 75 50
                 M30 60 Q 50 55, 70 60"
              fill="none"
              stroke="#654321"
              strokeWidth="1"
              opacity="0.5"
            />
            {isCracked && (
              <path
                d="M20 40 Q 50 50, 80 40"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

