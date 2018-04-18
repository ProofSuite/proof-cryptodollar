import { combineReducers } from 'redux'

import {
  ACCOUNTS_LOADING,
  ACCOUNT_ERROR,
  UPDATE_ACCOUNTS,
  ADD_ACCOUNT,
  ADD_ACCOUNTS,
  DELETE_ACCOUNT
} from '../../actions/accountActions'

const initialStatus = {
  loading: false,
  error: null
}

const status = (state = initialStatus, action) => {
  switch (action.type) {
    case ACCOUNTS_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case ACCOUNT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      }
    case ADD_ACCOUNT:
    case ADD_ACCOUNTS:
    case UPDATE_ACCOUNTS:
    case DELETE_ACCOUNT:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

const addresses = (state = [], action) => {
  let { type, payload } = action
  switch (type) {
    case UPDATE_ACCOUNTS:
      return payload.accounts
    case ADD_ACCOUNT:
      return [ ...new Set([...state, payload.account]) ]
    case ADD_ACCOUNTS:
      return [...new Set([...state, ...payload.accounts])]
    case DELETE_ACCOUNT:
      return state.filter(item => item !== payload.account)
    default:
      return state
  }
}

const accounts = combineReducers({
  status,
  addresses
})

export default accounts
