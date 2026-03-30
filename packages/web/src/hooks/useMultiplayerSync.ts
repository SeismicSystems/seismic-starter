import { useEffect, useRef } from 'react'
import type { ShieldedPublicClient } from 'seismic-viem'
import type { Abi, Hex, Log } from 'viem'

import { useToastNotifications } from './useToastNotifications'

interface UseMultiplayerSyncOptions {
  publicClient: ShieldedPublicClient | null
  contractAddress: Hex
  abi: Abi
  userAddress: Hex | null
  onStaminaChange: (stamina: number) => void
  onReset: (stamina: number) => void
  enabled?: boolean
}

const POLLING_INTERVAL = 4_000

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const useMultiplayerSync = ({
  publicClient,
  contractAddress,
  abi,
  userAddress,
  onStaminaChange,
  onReset,
  enabled = true,
}: UseMultiplayerSyncOptions) => {
  const { notifyWarning, notifySuccess } = useToastNotifications()

  // Use refs to avoid re-subscribing when callbacks change
  const onStaminaChangeRef = useRef(onStaminaChange)
  const onResetRef = useRef(onReset)
  const notifyWarningRef = useRef(notifyWarning)
  const notifySuccessRef = useRef(notifySuccess)

  useEffect(() => {
    onStaminaChangeRef.current = onStaminaChange
    onResetRef.current = onReset
    notifyWarningRef.current = notifyWarning
    notifySuccessRef.current = notifySuccess
  }, [onStaminaChange, onReset, notifyWarning, notifySuccess])

  // Watch Hit events
  useEffect(() => {
    if (!publicClient || !enabled || !userAddress) return

    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi,
      eventName: 'Hit',
      pollingInterval: POLLING_INTERVAL,
      onLogs: (logs: Log[]) => {
        for (const log of logs) {
          const args = (log as any).args as {
            round?: bigint
            hitter?: string
            remaining?: bigint
          }
          if (!args?.hitter || args?.remaining === undefined) continue

          // Skip own events — already handled by the action flow
          if (args.hitter.toLowerCase() === userAddress.toLowerCase()) continue

          const remaining = Number(args.remaining)
          onStaminaChangeRef.current(remaining)

          if (remaining === 0) {
            notifyWarningRef.current(
              `${shortenAddress(args.hitter)} knocked out the clown!`
            )
          } else {
            notifyWarningRef.current(
              `${shortenAddress(args.hitter)} punched the clown! Stamina: ${remaining}`
            )
          }
        }
      },
    })

    return () => unwatch()
  }, [publicClient, contractAddress, abi, userAddress, enabled])

  // Watch Reset events
  useEffect(() => {
    if (!publicClient || !enabled) return

    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi,
      eventName: 'Reset',
      pollingInterval: POLLING_INTERVAL,
      onLogs: (logs: Log[]) => {
        for (const log of logs) {
          const args = (log as any).args as {
            newRound?: bigint
            remainingClownStamina?: bigint
          }
          if (args?.remainingClownStamina === undefined) continue

          const stamina = Number(args.remainingClownStamina)
          onResetRef.current(stamina)
          notifySuccessRef.current(
            `New round started! Clown stamina: ${stamina}`
          )
        }
      },
    })

    return () => unwatch()
  }, [publicClient, contractAddress, abi, enabled])
}
