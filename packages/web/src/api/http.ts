import { BASE_API_URL } from '@/api'
import { Round } from '@/types/round'

export const fetchRounds = async (): Promise<Round[]> => {
  const url = `${BASE_API_URL}/rounds`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch rounds')
  }

  return await response.json()
}

export const fetchRoundById = async (roundId: number): Promise<Round> => {
  const response = await fetch(`${BASE_API_URL}/rounds/${roundId.toString()}`)
  if (!response.ok) {
    throw new Error(`Response not ok for round ${roundId}`)
  }
  const data: { round: Round } = await response.json()
  return data.round
}
