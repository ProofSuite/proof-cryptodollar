import {
  ACCOUNT_BALANCES_LOADING,
  ACCOUNT_BALANCES_ERROR,
  ACCOUNT_BALANCES_UPDATED
} from '../../components/accountBalances/actions'

const initialState = {
  loading: false,
  error: null
}

const accountBalances = (state = initialState, action) => {
  let { type, payload } = action
  switch (type) {
    case ACCOUNT_BALANCES_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case ACCOUNT_BALANCES_ERROR:
      return {
        ...state,
        loading: false,
        error: payload.error
      }
    case ACCOUNT_BALANCES_UPDATED:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

export default accountBalances
