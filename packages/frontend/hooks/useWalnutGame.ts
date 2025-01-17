import { useState, useCallback, useEffect } from 'react';

export function useWalnutGame() {
  const [hits, setHits] = useState<number | null>(null);
  const [secretNumber, setSecretNumber] = useState<number | null>(null);
  const [isCracked, setIsCracked] = useState(false);

  useEffect(() => {
    // Initialize the random values on the client side
    setHits(Math.floor(Math.random() * 10) + 5);
    setSecretNumber(Math.floor(Math.random() * 20) + 1);
  }, []);

  const shake = useCallback(() => {
    setSecretNumber(prev => (prev !== null ? prev + 1 : null));
  }, []);

  const hit = useCallback(() => {
    if (hits !== null && hits > 0) {
      setHits(prev => {
        if (prev !== null) {
          const newHits = prev - 1;
          if (newHits === 0) {
            setIsCracked(true);
          }
          return newHits;
        }
        return prev;
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

