import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useWalnutHit, useWalnutShake } from '../hooks/useWalnutContract'

interface WalnutProps {
  isCracked: boolean;
  isShakingAnimation: boolean;
  isHittingAnimation: boolean;
}

export default function Walnut({ isCracked, isShakingAnimation, isHittingAnimation }: WalnutProps) {
  const controls = useAnimation();
  const { write: hit, isLoading: isHitting } = useWalnutHit()
  const { write: shake, isLoading: isShaking } = useWalnutShake()

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
      await hit()
    } catch (error) {
      console.error('Error hitting walnut:', error)
    }
  }

  const handleShake = async () => {
    try {
      await shake()
    } catch (error) {
      console.error('Error shaking walnut:', error)
    }
  }

  return (
    <div>
      <button 
        onClick={handleHit}
        disabled={isHitting}
      >
        {isHitting ? 'Hitting...' : 'Hit'}
      </button>

      <button 
        onClick={handleShake}
        disabled={isShaking}
      >
        {isShaking ? 'Shaking...' : 'Shake'}
      </button>
    </div>
  );
}

