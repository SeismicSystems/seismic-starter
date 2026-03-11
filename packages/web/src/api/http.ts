import { Round } from '@/types/round'

export const fetchRounds = async (): Promise<Round[]> => {
  return Promise.resolve([])
}

export const fetchRoundById = async (roundId: number): Promise<Round> => {
  return Promise.resolve({
    id: roundId,
    chainId: 1,
    roundId: roundId,
    initialShellStrength: 3,
    shellStrength: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}
