import { useShieldedWriteContract } from 'seismic-react'

const WALNUT_ABI = [
  {
    type: "function",
    name: "hit",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function", 
    name: "shake",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const

// Get this from your deployment
const WALNUT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'

export function useWalnutHit() {
  return useShieldedWriteContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'hit'
  })
}

export function useWalnutShake() {
  return useShieldedWriteContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'shake'
  })
} 