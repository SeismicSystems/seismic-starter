'use client'

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWalnutGame } from '../hooks/useWalnutGame';
import Walnut from './Walnut';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalnutGame() {
  const { hits, secretNumber, isCracked, shake, hit, reset } = useWalnutGame();
  const [isShaking, setIsShaking] = useState(false);
  const [isHitting, setIsHitting] = useState(false);

  const handleShake = () => {
    setIsShaking(true);
    shake();
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleHit = () => {
    setIsHitting(true);
    hit();
    setTimeout(() => setIsHitting(false), 300);
  };

  const buttonStyle = {
    padding: '12px 24px',
    margin: '0 15px',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-8">
      <h1 className="text-5xl font-bold mb-10 text-brown-600">Walnut Cracker</h1>
      
      <div className="mb-10">
        <ConnectButton />
      </div>

      <div className="mb-10 text-center">
        <p className="text-2xl font-medium text-brown-600">
          Hits Remaining: <span className="font-bold">{hits}</span>
        </p>
        <p className="text-2xl font-medium text-brown-600">
          Secret Number: <span className="font-bold">{isCracked ? secretNumber : '???'}</span>
        </p>
      </div>

      <div className="flex justify-center items-center mb-10">
        <Walnut isCracked={isCracked} isShaking={isShaking} isHitting={isHitting} />
        {isCracked && secretNumber !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-bold text-brown-800"
          >
            {secretNumber}
          </motion.div>
        )}
      </div>

      <div className="w-80 bg-brown-200 rounded-full h-6 mb-10">
        <div
          className="bg-brown-600 rounded-full h-6 transition-all duration-300 ease-out"
          style={{ width: `${((hits ?? 0) / 15) * 100}%` }}
        />
      </div>

      <div className="flex space-x-6 mt-10">
        <button
          onClick={handleShake}
          style={{ ...buttonStyle, backgroundColor: 'green', color: 'white' }}
        >
          Shake
        </button>
        <button
          onClick={handleHit}
          style={{ ...buttonStyle, backgroundColor: 'red', color: 'white' }}
        >
          Hit
        </button>
        <button
          onClick={reset}
          style={{ ...buttonStyle, backgroundColor: 'yellow', color: 'black' }}
        >
          Reset
        </button>
      </div>

      {isCracked && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-green-600 font-bold text-2xl"
        >
          Cracked! The secret number is {secretNumber}
        </motion.p>
      )}
    </div>
  );
}

