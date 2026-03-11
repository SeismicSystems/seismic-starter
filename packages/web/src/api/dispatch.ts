import {
  fetchRoundsStart,
  fetchRoundsSuccess,
} from '@/store/slice'
import { Dispatch } from '@reduxjs/toolkit'

export const fetchRoundsAction = () => async (dispatch: Dispatch) => {
  dispatch(fetchRoundsStart())
  dispatch(fetchRoundsSuccess([]))
}
