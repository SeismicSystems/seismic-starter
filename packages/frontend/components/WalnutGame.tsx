'use client'

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWalnutGame } from '../hooks/useWalnutGame';
import Walnut from './Walnut';
import WalletConnect from './WalletConnect';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
      <h1 className="text-4xl font-bold mb-8 text-brown-600">Walnut Cracker</h1>
      
      <div className="mb-8">
        <WalletConnect />
      </div>

      <div className="mb-8 text-center">
        <p className="text-lg font-medium text-brown-600">
          Hits Remaining: <span className="font-bold">{hits}</span>
        </p>
        <p className="text-lg font-medium text-brown-600">
          Secret Number: <span className="font-bold">{isCracked ? secretNumber : '???'}</span>
        </p>
      </div>

      <div className="relative mb-8">
        <Walnut isCracked={isCracked} isShaking={isShaking} isHitting={isHitting} />
        {isCracked && secretNumber !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-brown-800"
          >
            {secretNumber}
          </motion.div>
        )}
      </div>

      <div className="w-64 bg-brown-200 rounded-full h-4 mb-8">
        <div
          className="bg-brown-600 rounded-full h-4 transition-all duration-300 ease-out"
          style={{ width: `${(hits / 15) * 100}%` }}
        />
      </div>

      <div className="space-x-4">
        <button
          onClick={handleShake}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Shake
        </button>
        <button
          onClick={handleHit}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Hit
        </button>
        <button
          onClick={reset}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Reset
        </button>
      </div>

      {isCracked && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-green-600 font-bold text-lg"
        >
          Cracked! The secret number is {secretNumber}
        </motion.p>
      )}
    </div>
  );
}

