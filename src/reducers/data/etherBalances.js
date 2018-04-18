// etherBalances: {
//   byAddress: {
//      0x234: {
//         etherBalance: xx
//      },
//      0x234: {
//         etherBalance: xx,
//      },
//      0x345: {
//         etherBalance: xx,
//         }
//    },
//    allAddresses: [0x234, 0x235 ,0x236 , …]
//  }
import { combineReducers } from 'redux'
import { removeByKey } from './helpers'

import {
  ETHER_BALANCES_LOADING,
  ETHER_BALANCES_ERROR,
  UPDATE_ETHER_BALANCE,
  UPDATE_ETHER_BALANCES,
  DELETE_ETHER_BALANCE
} from '../../actions/etherBalancesActions'

const initialStatus = {
  loading: false,
  error: null
}

const status = (state = initialStatus, action) => {
  switch (action.type) {
    case ETHER_BALANCES_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case ETHER_BALANCES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      }
    case UPDATE_ETHER_BALANCE:
    case UPDATE_ETHER_BALANCES:
    case DELETE_ETHER_BALANCE:
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
    case UPDATE_ETHER_BALANCE:
      let { address, etherBalance } = payload
      return {
        ...state,
        [payload.address]: { address, etherBalance }
      }
    case UPDATE_ETHER_BALANCES:
      let newState = payload.etherBalances.reduce((result, item) => {
        result[item.address] = { address: item.address, etherBalance: item.etherBalance }
        return result
      }, {})
      return {
        ...state,
        ...newState
      }
    case DELETE_ETHER_BALANCE:
      return removeByKey(state, payload.address)
    default:
      return state
  }
}

const allAddresses = (state = [], action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_ETHER_BALANCE:
      return [ ...new Set([...state, payload.address]) ]
    case UPDATE_ETHER_BALANCES:
      let newAddresses = payload.etherBalances.map(item => item.address)
      return [ ...new Set([...state, ...newAddresses]) ]
    case DELETE_ETHER_BALANCE:
      return state.filter(address => address !== payload.address)
    default:
      return state
  }
}

const etherBalances = combineReducers({
  status,
  byAddress,
  allAddresses
})

export default etherBalances
