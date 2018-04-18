import { combineReducers } from 'redux'

import {
  WALLETS_LOADING,
  WALLETS_ERROR,
  ADD_WALLET,
  SET_DEFAULT_WALLET,
  ADD_WALLETS,
  DELETE_WALLET,
  DELETE_WALLETS,
  WALLET_AUTHENTICATING,
  WALLET_AUTHENTICATED,
  WALLET_AUTHENTICATION_ERROR,
  WALLET_UNAUTHENTICATE
} from '../../actions/walletActions'

import { removeByKey, removeByKeys } from './helpers'

const initialState = {
  status: {
    loading: false,
    error: null,
    defaultWallet: null
  },
  authentication: {
    authenticating: false,
    authenticated: false,
    error: null
  },
  byAddresses: {},
  allAddresses: []
}

const status = (state = initialState.status, action) => {
  switch (action.type) {
    case WALLETS_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
        defaultWallet: state.defaultWallet
      }
    case WALLETS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        defaultWallet: state.defaultWallet
      }
    case SET_DEFAULT_WALLET:
      return {
        ...state,
        loading: false,
        error: null,
        defaultWallet: action.payload.defaultWallet
      }
    default:
      return state
  }
}

const authentication = (state = initialState.authentication, action) => {
  switch (action.type) {
    case WALLET_AUTHENTICATING:
      return {
        ...state,
        authenticating: true,
        authenticated: false,
        error: null
      }
    case WALLET_AUTHENTICATED:
      return {
        ...state,
        authenticating: false,
        authenticated: true,
        error: null
      }
    case WALLET_UNAUTHENTICATE:
      return {
        ...state,
        authenticating: false,
        authenticated: false,
        error: null
      }
    case WALLET_AUTHENTICATION_ERROR:
      return {
        ...state,
        authenticated: false,
        authenticating: false,
        error: action.payload.error
      }
    default:
      return state
  }
}

const byAddress = (state = {}, action) => {
  let { type, payload } = action
  switch (type) {
    case ADD_WALLET:
      return {
        ...state,
        [payload.address]: {
          address: payload.address,
          serialized: payload.serialized
        }
      }
    case ADD_WALLETS:
      let newState = payload.wallets.reduce((result, item) => {
        result[item.address] = { address: item.address, serialized: item.serialized }
        return result
      }, {})
      return {
        ...state,
        ...newState
      }
    case DELETE_WALLET:
      return removeByKey(state, payload.address)
    case DELETE_WALLETS:
      return removeByKeys(state, payload.addresses)
    default:
      return state
  }
}

const allAddresses = (state = [], action) => {
  let { type, payload } = action
  switch (type) {
    case ADD_WALLET:
      return [...new Set([...state, payload.address])]
    case ADD_WALLETS:
      let newAddresses = payload.wallets.map(item => item.address)
      return [...new Set([...state, ...newAddresses])]
    case DELETE_WALLET:
      return state.filter(address => address !== payload.address)
    case DELETE_WALLETS:
      return state.filter(address => (payload.addresses.indexOf(address) === -1))
    default:
      return state
  }
}

const wallets = combineReducers({
  status,
  authentication,
  byAddress,
  allAddresses
})

export default wallets
