import type { Round } from '@/types/round'
import type { RoundUpdate } from '@/types/update'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from './store'

// Adjust path as needed

export type RoundsState = {
  currentRoundId: number | null
  entities: Record<string, Round>
  loading: boolean
  error: string | null
}

const initialState: RoundsState = {
  currentRoundId: null,
  entities: {},
  loading: false,
  error: null,
}

const roundsSlice = createSlice({
  name: 'rounds',
  initialState,
  reducers: {
    fetchRoundsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchRoundsSuccess(state, action: PayloadAction<Round[]>) {
      state.loading = false
      action.payload.forEach((round) => {
        state.entities[round.id.toString()] = {
          ...state.entities[round.id.toString()],
          ...round,
        }
      })
      const maxRoundId = Math.max(
        ...action.payload.map((round) => round.id),
        state.currentRoundId ?? 0
      )
      state.currentRoundId = maxRoundId
    },
    fetchRoundsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    updateRound(state, action: PayloadAction<RoundUpdate>) {
      const update = action.payload
      const existingRound = state.entities[update.data.round.id.toString()]

      state.currentRoundId = action.payload.data.round.id
      if (existingRound) {
        // Merge the update with the existing coin
        state.entities[update.data.round.id.toString()] = {
          ...existingRound,
          ...update.data.round,
        }
      } else if (update.type === 'reset') {
        state.entities[update.data.round.id.toString()] = update.data.round
      }
    },
  },
})

export const {
  fetchRoundsStart,
  fetchRoundsSuccess,
  fetchRoundsFailure,
  updateRound,
} = roundsSlice.actions

// Base selector for coins state
export const selectRoundsState = (state: RootState) => state.rounds

// Selector for loading state
export const selectCoinsLoading = createSelector(
  [selectRoundsState],
  (coinsState) => coinsState.loading
)

// Selector for the entities dictionary
export const selectRoundsEntities = createSelector(
  [selectRoundsState],
  (roundsState) => roundsState.entities || {}
)

export const selectCurrentRoundId = createSelector(
  [selectRoundsState],
  (roundsState) => roundsState.currentRoundId
)

// Individual entity selectors with field-specific dependencies
export const selectRoundById = (roundId: number | null) =>
  createSelector([selectRoundsEntities], (entities) =>
    roundId === null ? null : (entities[roundId.toString()] ?? null)
  )

export const selectRoundShellStrength = (roundId: number | null) =>
  createSelector([selectRoundById(roundId)], (round) =>
    round === null ? null : (round.shellStrength ?? null)
  )

// Main selector that returns entities but with identity based on tracked fields
export const selectAllRounds = createSelector(
  [
    selectRoundsEntities,
    (state) => {
      const entities = selectRoundsEntities(state)
      // This creates a dependency on the specific fields we care about
      return Object.keys(entities).reduce(
        (acc, id) => {
          acc[id] = {
            roundId: entities[id].roundId,
            shellStrength: entities[id].shellStrength,
            updatedAt: entities[id].updatedAt,
          }
          return acc
        },
        {} as Record<
          string,
          Pick<Round, 'roundId' | 'shellStrength' | 'updatedAt'>
        >
      )
    },
  ],
  // Return the full entities dictionary, but only when tracked fields change
  (entities) => entities
)

export default roundsSlice.reducer
