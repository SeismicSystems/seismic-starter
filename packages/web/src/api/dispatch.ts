import { fetchRoundById, fetchRounds } from '@/api/http'
import {
  fetchRoundsFailure,
  fetchRoundsStart,
  fetchRoundsSuccess,
} from '@/store/slice'
import { Dispatch } from '@reduxjs/toolkit'

export const fetchRoundByIdAction =
  (roundId: number) => async (dispatch: Dispatch) => {
    try {
      const round = await fetchRoundById(roundId)
      dispatch(fetchRoundsSuccess([round]))
      return round
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      dispatch(fetchRoundsFailure(errorMessage))
      throw error
    }
  }

export const fetchRoundsAction = () => async (dispatch: Dispatch) => {
  dispatch(fetchRoundsStart())

  try {
    const data = await fetchRounds()
    dispatch(fetchRoundsSuccess(data))
    return data
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    dispatch(fetchRoundsFailure(errorMessage))
    throw error
  }
}
