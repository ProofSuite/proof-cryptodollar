import {
  WALLET_BALANCES_LOADING,
  WALLET_BALANCES_ERROR,
  WALLET_BALANCES_UPDATED
} from '../../components/walletBalances/actions'

const initialState = {
  loading: false,
  error: null
}

const walletBalances = (state = initialState, action) => {
  let { type, payload } = action
  switch (type) {
    case WALLET_BALANCES_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case WALLET_BALANCES_ERROR:
      return {
        ...state,
        loading: false,
        error: payload.error
      }
    case WALLET_BALANCES_UPDATED:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

export default walletBalances
