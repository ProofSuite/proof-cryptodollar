// tokenBalances: {
//   byId: {
//     1: {
//      id: 1
//      accountAddress: 0x023,
//      tokenAddress: 0x123,
//      tokenBalance: xx
//     },
//     2: {
//      id: 2,
//      accountAddress: 0x023,
//      tokenAddress: 0x123
//      tokenBalance: xx,
//     },
//     3: {
//       id: 3,
//       accountAddress: 0x023,
//       token: 3,
//       tokenBalance: xx
//     },
//     4: {
//       id: 4,
//       accountAddress: 0x24,
//       token: 1
//       tokenBalance: xx
//     }
//     …
//   },
//   allIds: [1,2,3, …]

import { combineReducers } from 'redux'
import { removeByKey } from './helpers'

import {
  TOKEN_BALANCES_LOADING,
  TOKEN_BALANCES_ERROR,
  UPDATE_TOKEN_BALANCE,
  DELETE_TOKEN_BALANCE
} from '../../actions/tokenBalancesActions'

let initialStatus = {
  loading: false,
  error: null
}

const status = (state = initialStatus, action) => {
  switch (action.type) {
    case TOKEN_BALANCES_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case TOKEN_BALANCES_ERROR:
      return {
        ...state,
        loading: true,
        error: action.payload.error
      }
    case UPDATE_TOKEN_BALANCE:
    case DELETE_TOKEN_BALANCE:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

const tokenBalance = (state, action) => {
  let { id, accountAddress, tokenAddress, tokenBalance } = action.payload
  switch (action.type) {
    case UPDATE_TOKEN_BALANCE:
      return {
        id,
        accountAddress,
        tokenAddress,
        tokenBalance
      }
    default:
      return state
  }
}

const byId = (state = {}, action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_TOKEN_BALANCE:
      return {
        ...state,
        [payload.id]: tokenBalance(state[payload.id], action)
      }
    case DELETE_TOKEN_BALANCE:
      return removeByKey(state, payload.id)
    default:
      return state
  }
}

const allIds = (state = [], action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_TOKEN_BALANCE:
      return [...new Set([...state, payload.id])]
    case DELETE_TOKEN_BALANCE:
      return state.filter(id => id !== payload.id)
    default:
      return state
  }
}

const etherBalances = combineReducers({
  status,
  byId,
  allIds
})

export default etherBalances
