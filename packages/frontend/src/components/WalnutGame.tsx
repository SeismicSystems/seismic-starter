'use client'

import { motion } from 'framer-motion';
import { useState } from 'react';
import Walnut from './Walnut';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useGetShellStrength, useGetWalnutContract } from '../hooks/useWalnutContract';

export default function WalnutGame() {
  const { contract: walnutContract } = useGetWalnutContract()
  const { data: shellStrengthData } = useGetShellStrength()
  const shellStrength = shellStrengthData as number | undefined

  // Add state for animations and look result
  const [isShaking, setIsShaking] = useState(false);
  const [isHitting, setIsHitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [lookResult, setLookResult] = useState<string | null>(null);

  const handleShake = async () => {
    setIsShaking(true);
    try {
      await walnutContract?.write.shake([1], { gas: 100000 })
    } catch (error) {
      console.error('Error shaking walnut:', error);
    } finally {
      setIsShaking(false);
    }
  };

  const handleHit = async () => {
    setIsHitting(true);
    try {
      await walnutContract?.write.hit([], { gas: 100000 })
    } catch (error) {
      console.error('Error hitting walnut:', error);
    } finally {
      setIsHitting(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await walnutContract?.write.reset([], { gas: 100000 })
    } catch (error) {
      console.error('Error resetting walnut:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLook = async () => {
    setIsLooking(true);
    try {
      // Simple read call without transaction parameters
      const result = await walnutContract?.read.look();
      console.log('Look result:', result);
      setLookResult(result ? result.toString() : null);
    } catch (error) {
      console.error('Error looking at walnut:', error);
      setLookResult('Error: Please check your connection');
    } finally {
      setIsLooking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-8">
      <h1 className="text-5xl font-bold mb-10 text-brown-600 text-center">Walnut Cracker</h1>
      
      <div className="mb-10 flex justify-center">
        <ConnectButton />
      </div>

      <div className="mb-10 text-center">
        <p className="text-2xl font-medium text-brown-600">
          Shell Strength: <span className="font-bold">{shellStrength ?? 'Loading...'}</span>
        </p>
        {shellStrength === 0 && (
          <p className="text-2xl font-medium text-brown-600">
            Secret Number: <span className="font-bold">69</span>
          </p>
        )}
        {lookResult && (
          <p className="text-2xl font-medium text-brown-600">
            Look Result: <span className="font-bold">{lookResult}</span>
          </p>
        )}
      </div>

      <div className="flex justify-center items-center mb-10">
        <Walnut 
          isCracked={shellStrength === 0} 
          isShakingAnimation={isShaking}
          isHittingAnimation={isHitting}
        />
      </div>

      <div className="flex space-x-6">
        <button
          onClick={handleShake}
          className="px-8 py-4 bg-green-500 text-white rounded-lg"
        >
          Shake
        </button>
        <button
          onClick={handleHit}
          className="px-8 py-4 bg-red-500 text-white rounded-lg"
        >
          Hit
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={handleLook}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg"
        >
          Look
        </button>
      </div>
    </div>
  );
}