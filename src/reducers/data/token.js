// tokenBalances: {
//   byAddress: {
//     0x123: {
//      address: 0x123,
//      symbol: ZRX
//     },
//     0x124: {
//       address: 0x124,
//       symbol: EOS
//     }
//     …
//   },
//   allAddresses: [1,2, …]

import { combineReducers } from 'redux'
import { removeByKey } from './helpers'

import {
  TOKEN_LOADING,
  TOKEN_ERROR,
  UPDATE_TOKEN,
  DELETE_TOKEN
} from '../../actions/tokenActions'

const initialState = {
  status: {
    loading: false,
    error: null
  },
  byAddress: {},
  allAddresses: []
}

const status = (state = initialState.status, action) => {
  switch (action.type) {
    case TOKEN_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case TOKEN_ERROR:
      return {
        ...state,
        loading: true,
        error: action.payload.error
      }
    case UPDATE_TOKEN:
    case DELETE_TOKEN:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

const token = (state, action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_TOKEN:
      return { ...state, address: payload.address, symbol: payload.symbol }
    default:
      return state
  }
}

const byAddress = (state = initialState.byAddress, action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_TOKEN:
      return {
        ...state,
        [payload.address]: token(state[payload.address], action)
      }
    case DELETE_TOKEN:
      return removeByKey(state, payload.address)
    default:
      return state
  }
}

const allAddresses = (state = initialState.allAddresses, action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_TOKEN:
      if (state.indexOf(payload.address) === -1) {
        return [...state, payload.address]
      } else {
        return state
      }
    case DELETE_TOKEN:
      return state.filter((address) => (address !== payload.address))
    default:
      return state
  }
}

const tokens = combineReducers({
  status,
  byAddress,
  allAddresses
})

export default tokens
