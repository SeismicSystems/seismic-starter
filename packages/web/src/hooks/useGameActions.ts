import { useCallback, useState } from 'react'
import { useSound } from 'use-sound'

export const useGameActions = () => {
  const [isShaking, setIsShaking] = useState(false)
  const [isHitting, setIsHitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isLooking, setIsLooking] = useState(false)
  const [lookResult, setLookResult] = useState<bigint | null>(null)
  const [punchCount, setPunchCount] = useState(0)
  const [shellStrength, setShellStrength] = useState<number | null>(3)

  const [playHit] = useSound('/audio/hit_sfx.wav', { volume: 0.1 })
  const [playShake] = useSound('/audio/shake_sfx.wav', { volume: 0.1 })
  const [playReset] = useSound('/audio/reset_sfx.wav', { volume: 0.1 })
  const [playRob] = useSound('/audio/rob_sfx.wav', { volume: 0.1 })

  const fetchGameRounds = useCallback(() => {
    // Stub: no-op
  }, [])

  const resetGameState = useCallback(() => {
    console.log('Resetting game state')
    setLookResult(null)
    setPunchCount(0)
    setShellStrength(3)
  }, [])

  const handleShake = useCallback(() => {
    playShake()
    if (isShaking) return
    setIsShaking(true)
    setTimeout(() => {
      setIsShaking(false)
    }, 500)
  }, [isShaking, playShake])

  const handleHit = useCallback(() => {
    playHit()
    if (isHitting) return
    setIsHitting(true)
    setPunchCount((prev) => {
      const next = Math.min(prev + 1, 3)
      if (next >= 3) {
        setShellStrength(0)
      }
      return next
    })
    setTimeout(() => {
      setIsHitting(false)
    }, 300)
  }, [isHitting, playHit])

  const handleReset = useCallback(() => {
    playReset()
    if (isResetting) return
    setIsResetting(true)
    setPunchCount(0)
    setShellStrength(3)
    setTimeout(() => {
      setIsResetting(false)
    }, 300)
  }, [isResetting, playReset])

  const handleLook = useCallback(() => {
    playRob()
    if (isLooking) return
    setIsLooking(true)
    setLookResult(BigInt(Math.floor(Math.random() * 1000)))
    setTimeout(() => {
      setIsLooking(false)
    }, 300)
  }, [isLooking, playRob])

  return {
    loaded: true,
    shellStrength,
    currentRoundId: 1 as number | null,
    isShaking,
    isHitting,
    isResetting,
    isLooking,
    lookResult,
    punchCount,
    fetchGameRounds,
    resetGameState,
    handleShake,
    handleHit,
    handleReset,
    handleLook,
  }
}
