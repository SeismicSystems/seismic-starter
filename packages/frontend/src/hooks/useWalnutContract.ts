import { useShieldedWriteContract } from 'seismic-react'
import { useReadContract } from 'wagmi';
import walnutJson from '../../../contracts/out/Walnut.sol/Walnut.json';

const WALNUT_ABI = walnutJson.abi

// Get this from your deployment
const WALNUT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'

export function useWalnutHit() {
  return useShieldedWriteContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'hit',
    gas: 100000,
  })
}

export function useWalnutShake() {
  return useShieldedWriteContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'shake',
    args: [1],

  })
} 

export function useGetShellStrength() {
  return useReadContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'getShellStrength',
  })
}

export function useReset() {
  return useShieldedWriteContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'reset',
    gas: 100000,
  })
}