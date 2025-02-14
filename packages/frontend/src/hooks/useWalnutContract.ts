import { useShieldedContract, useShieldedWriteContract, useSignedReadContract } from 'seismic-react'
import { useReadContract } from 'wagmi';
import walnutJson from '../../../contracts/out/Walnut.sol/Walnut.json';
import { useState, useEffect } from 'react';

const WALNUT_ABI = walnutJson.abi

// Get this from your deployment
const WALNUT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'

export function useGetWalnutContract() {
  return useShieldedContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
  })
}

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
    functionName: 'shake',
    args: [1]
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
    functionName: 'reset'
  })
}

export function useLook() {
  return useSignedReadContract({
    address: WALNUT_ADDRESS,
    abi: WALNUT_ABI,
    functionName: 'look'
  })
}