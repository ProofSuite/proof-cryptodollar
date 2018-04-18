// cryptoDollarBalances:
//   status: {
//      loading: false,
//      error: null
//   },
//   byAddress: {
//      0x234: {
//         cryptoDollarBalance: xx,
//         reservedEtherBalance: xx
//      },
//      0x234: {
//         cryptoDollarBalance: xx,
//         reservedEtherBalance: xx
//      },
//      0x345: {
//         cryptoDollarBalance: xx,
//         reservedEtherBalance: xx
//         }
//    },
//    allAddresses: [0x234, 0x235 ,0x236 , …]
//  }

import { combineReducers } from 'redux'
import { removeByKey } from './helpers'

import {
  CRYPTODOLLAR_BALANCES_LOADING,
  CRYPTODOLLAR_BALANCES_ERROR,
  UPDATE_CRYPTODOLLAR_BALANCE,
  UPDATE_CRYPTODOLLAR_BALANCES,
  DELETE_CRYPTODOLLAR_BALANCE
} from '../../actions/cryptoDollarBalancesActions.js'

const initialStatus = {
  loading: false,
  error: null
}

const status = (state = initialStatus, action) => {
  let { type, payload } = action
  switch (type) {
    case CRYPTODOLLAR_BALANCES_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case CRYPTODOLLAR_BALANCES_ERROR:
      return {
        ...state,
        loading: false,
        error: payload.error
      }
    case UPDATE_CRYPTODOLLAR_BALANCE:
    case UPDATE_CRYPTODOLLAR_BALANCES:
    case DELETE_CRYPTODOLLAR_BALANCE:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

const byAddress = (state = {}, action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_CRYPTODOLLAR_BALANCE:
      let { address, cryptoDollarBalance, reservedEtherBalance } = payload
      return {
        ...state,
        [payload.address]: { address, cryptoDollarBalance, reservedEtherBalance }
      }
    case UPDATE_CRYPTODOLLAR_BALANCES:
      let newState = payload.cryptoDollarBalances.reduce((result, item) => {
        result[item.address] = {
          address: item.address,
          cryptoDollarBalance: item.cryptoDollarBalance,
          reservedEtherBalance: item.reservedEtherBalance
        }
        return result
      }, {})
      return {
        ...state,
        ...newState
      }
    case DELETE_CRYPTODOLLAR_BALANCE:
      return removeByKey(state, payload.address)
    default:
      return state
  }
}

const allAddresses = (state = [], action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_CRYPTODOLLAR_BALANCE:
      return [...new Set([...state, payload.address])]
    case UPDATE_CRYPTODOLLAR_BALANCES:
      let newAddresses = payload.cryptoDollarBalances.map(item => item.address)
      return [...new Set([...state, ...newAddresses])]
    case DELETE_CRYPTODOLLAR_BALANCE:
      return state.filter((address) => (address !== payload.address))
    default:
      return state
  }
}

const cryptoDollarBalances = combineReducers({
  status,
  byAddress,
  allAddresses
})

export default cryptoDollarBalances
