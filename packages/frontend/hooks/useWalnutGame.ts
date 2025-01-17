import { useState, useCallback } from 'react';

export function useWalnutGame() {
  const [hits, setHits] = useState(() => Math.floor(Math.random() * 10) + 5); // Random number between 5 and 14
  const [secretNumber, setSecretNumber] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [isCracked, setIsCracked] = useState(false);

  const shake = useCallback(() => {
    setSecretNumber(prev => prev + 1);
  }, []);

  const hit = useCallback(() => {
    if (hits > 0) {
      setHits(prev => {
        const newHits = prev - 1;
        if (newHits === 0) {
          setIsCracked(true);
        }
        return newHits;
      });
    }
  }, [hits]);

  const reset = useCallback(() => {
    setHits(Math.floor(Math.random() * 10) + 5);
    setSecretNumber(Math.floor(Math.random() * 20) + 1);
    setIsCracked(false);
  }, []);

  return { 
    hits, 
    secretNumber: isCracked ? secretNumber : null, 
    isCracked, 
    shake, 
    hit, 
    reset 
  };
}

