import { useCallback, useEffect, useState } from 'react'
import React from 'react'
import { useSound } from 'use-sound'

import { ExplorerToast } from '@/components/chain/ExplorerToast'
import { useContractClient } from '@/hooks/useContractClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'

export const useGameActions = () => {
  const [clownStamina, setClownStamina] = useState<number | null>(null)
  const [currentRoundId] = useState<number | null>(1)

  const {
    loaded,
    hit,
    rob,
    reset,
    txUrl,
    waitForTransaction,
    clownStamina: readClownStamina,
  } = useContractClient()

  const { notifySuccess, notifyError, notifyInfo } = useToastNotifications()
  const [isHitting, setIsHitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isRobbing, setIsRobbing] = useState(false)
  const [robResult, setRobResult] = useState<string | null>(null)
  const [punchCount, setPunchCount] = useState(0)
  const [playHit] = useSound('/audio/hit_sfx.wav', { volume: 0.1 })
  const [playReset] = useSound('/audio/reset_sfx.wav', { volume: 0.1 })
  const [playRob] = useSound('/audio/rob_sfx.wav', { volume: 0.1 })

  const fetchGameRounds = useCallback(() => {
    if (!loaded) return
    readClownStamina()
      .then((stamina) => {
        setClownStamina(Number(stamina))
      })
      .catch((error) => {
        console.error('Error fetching clown stamina:', error)
      })
  }, [loaded, readClownStamina])

  // Fetch initial state when contract is loaded
  useEffect(() => {
    fetchGameRounds()
  }, [fetchGameRounds])

  const resetGameState = useCallback(() => {
    setRobResult(null)
    setPunchCount(0)
  }, [punchCount])

  const handleHit = async () => {
    playHit()
    if (!loaded || isHitting) return
    setIsHitting(true)
    hit()
      .then((hash) => {
        const url = txUrl(hash)
        if (url) {
          notifyInfo(
            React.createElement(ExplorerToast, {
              url: url,
              text: 'Sent punch tx: ',
              hash: hash,
            })
          )
        } else {
          notifyInfo(`Sent punch tx: ${hash}`)
        }
        if (clownStamina && clownStamina > 0) {
          setPunchCount((prev) => {
            const newCount = Math.min(prev + 1, 3)
            return newCount
          })
        }
        setIsHitting(false)
        return waitForTransaction(hash)
      })
      .then((receipt) => {
        if (receipt.status === 'success') {
          notifySuccess('Punch successful')
          // Re-read stamina from contract after successful hit
          fetchGameRounds()
        } else {
          notifyError('Punch failed')
        }
      })
      .catch((error) => {
        notifyError('Error punching clown: ', error.message)
      })
      .finally(() => {
        setIsHitting(false)
      })
  }

  const handleReset = async () => {
    playReset()
    if (!loaded || isResetting) return
    if (clownStamina !== 0) {
      notifyError('Clown must be KO to reset')
      return
    }
    setIsResetting(true)
    reset()
      .then((hash) => {
        const url = txUrl(hash)
        if (url) {
          notifyInfo(
            React.createElement(ExplorerToast, {
              url: url,
              text: 'Sent reset tx: ',
              hash: hash,
            })
          )
        } else {
          notifyInfo(`Sent reset tx: ${hash}`)
        }
        setPunchCount(0)
        setIsResetting(false)
        return waitForTransaction(hash)
      })
      .then((receipt) => {
        if (receipt.status === 'success') {
          notifySuccess('Reset successful')
          setRobResult(null)
          // Re-read stamina from contract after successful reset
          fetchGameRounds()
        } else {
          notifyError('Reset failed')
        }
      })
      .catch((error) => {
        notifyError('Error resetting clown: ', error.message)
      })
      .finally(() => {
        setIsResetting(false)
      })
  }

  const handleRob = async () => {
    playRob()
    if (!loaded || isRobbing) return
    setIsRobbing(true)
    rob()
      .then((result) => {
        setRobResult(result)
      })
      .catch((error) => {
        notifyError('Error robbing clown: ', error.message)
      })
      .finally(() => {
        setIsRobbing(false)
      })
  }

  return {
    loaded,
    clownStamina,
    currentRoundId,
    isHitting,
    isResetting,
    isRobbing,
    robResult,
    punchCount,
    fetchGameRounds,
    resetGameState,
    handleHit,
    handleReset,
    handleRob,
  }
}
