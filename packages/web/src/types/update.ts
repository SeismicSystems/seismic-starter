type Address = string

import { Round } from '@/types/round'

export type RoundUpdateType = 'hit' | 'shake' | 'reset'

export type Reset = {
  type: 'reset'
  data: { round: Round }
}

export type StateChange = {
  type: 'hit' | 'shake'
  data: { round: Round; address: Address }
}

export type StrengthChange = {
  type: 'strength'
  data: { round: Pick<Round, 'id' | 'shellStrength'> }
}

export type RoundUpdate = Reset | StateChange | StrengthChange
