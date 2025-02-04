'use client'

import { motion } from 'framer-motion';
import { useWalnutGame } from '../hooks/useWalnutGame';
import Walnut from './Walnut';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useGetShellStrength, useReset, useWalnutHit as useHitContract, useWalnutShake as useShakeContract } from '../hooks/useWalnutContract';

export default function WalnutGame() {
  // const { hits, secretNumber, isCracked, reset } = useWalnutGame();
  const { write: hitContract, isLoading: isHitting } = useHitContract();
  const { write: shakeContract, isLoading: isShaking } = useShakeContract();
  const { write: resetContract, isLoading: isResetting } = useReset();
  const { data: shellStrengthData } = useGetShellStrength();
  const shellStrength = shellStrengthData as number | undefined;

  const handleShake = async () => {
    try {
      await shakeContract();
    } catch (error) {
      console.error('Error shaking walnut:', error);
    }
  };

  const handleHit = async () => {
    try {
      await hitContract();
    } catch (error) {
      console.error('Error hitting walnut:', error);
    }
  };


  const buttonStyle = {
    padding: '16px 32px',
    margin: '0 15px',
    fontSize: '18px',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-8">
      <h1 className="text-5xl font-bold mb-10 text-brown-600 text-center">Walnut Cracker</h1>
      
      <div className="mb-10 flex justify-center">
        <ConnectButton />
      </div>

      <div className="mb-10 text-center">
        <p className="text-2xl font-medium text-brown-600">
          Hits Remaining: <span className="font-bold">{shellStrength ?? 'Loading...'}</span>
        </p>
        <p className="text-2xl font-medium text-brown-600">
          Secret Number: <span className="font-bold">{shellStrength === 0 ? 69: '???'}</span>
        </p>
      </div>

      <div className="flex justify-center items-center mb-10">
        <Walnut 
          isCracked={shellStrength === 0} 
          isShakingAnimation={isShaking} 
          isHittingAnimation={isHitting} 
        />
        {shellStrength === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-bold text-brown-800"
          >
            🎉
          </motion.div>
        )}
      </div>

      <div className="flex space-x-6 mt-10">
        <button
          onClick={handleShake}
          disabled={isShaking}
          style={{ 
            ...buttonStyle, 
            backgroundColor: isShaking ? '#90EE90' : 'green', 
            color: 'white' 
          }}
        >
          {isShaking ? 'Shaking...' : 'Shake'}
        </button>
        <button
          onClick={handleHit}
          disabled={isHitting}
          style={{ 
            ...buttonStyle, 
            backgroundColor: isHitting ? '#FFB6C1' : 'red', 
            color: 'white' 
          }}
        >
          {isHitting ? 'Hitting...' : 'Hit'}
        </button>
        <button
          onClick={resetContract}
          style={{ ...buttonStyle, backgroundColor: 'yellow', color: 'black' }}
        >
          Reset
        </button>
        <button
          onClick={() => shellStrength}
          style={{ ...buttonStyle, backgroundColor: 'purple', color: 'white' }}
        >
          Get Shell Strength
        </button>
      </div>
      {shellStrength==0 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-green-600 font-bold text-2xl"
        >
          Cracked! 
        </motion.p>
      )}
    </div>
  );
}

