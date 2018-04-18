import {
  WITHDRAW_REWARDS_TX_STARTED,
  WITHDRAW_REWARDS_TX_UPDATED,
  WITHDRAW_REWARDS_TX_ERROR,
  WITHDRAW_REWARDS_TX_SIGNED,
  WITHDRAW_REWARDS_TX_SIGNING,
  WITHDRAW_REWARDS_TX_SIGNING_ERROR,
  WITHDRAW_REWARDS_TX_SENT,
  WITHDRAW_REWARDS_TX_RECEIPT,
  WITHDRAW_REWARDS_TX_CONFIRMED
} from '../../../actions/rewards/withdraw'

let initialState = {
  txLoading: false,
  txError: null,
  txSigning: false,
  txSigned: false,
  txSigningError: null,
  tx: {
    status: 'incomplete',
    statusMessage: null,
    requiredGas: null,
    hash: null,
    receipt: null,
    signature: null
  }
}

const withdraw = (state = initialState, action) => {
  switch (action.type) {
    case WITHDRAW_REWARDS_TX_STARTED:
      return {
        ...state,
        txLoading: false,
        txError: null
      }
    case WITHDRAW_REWARDS_TX_UPDATED:
      return {
        ...state,
        tx: {
          ...(state.tx),
          status: action.payload.status,
          statusMessage: action.payload.statusMessage,
          requiredGas: action.payload.requiredGas || null
        }
      }
    case WITHDRAW_REWARDS_TX_ERROR:
      return {
        ...state,
        txLoading: false,
        txError: action.payload.error,
        tx: {
          ...(state.tx),
          receipt: action.payload.receipt
        }
      }
    case WITHDRAW_REWARDS_TX_SIGNING:
      return {
        ...state,
        txSigning: true,
        txSigned: false,
        txSigningError: null
      }
    case WITHDRAW_REWARDS_TX_SIGNED:
      return {
        ...state,
        txSigning: false,
        txSigned: true,
        txSigningError: null,
        tx: {
          ...(state.tx),
          signature: action.payload.signature
        }
      }
    case WITHDRAW_REWARDS_TX_SIGNING_ERROR:
      return {
        ...state,
        txSigning: false,
        txSigned: true,
        txSigningError: action.payload.error
      }
    case WITHDRAW_REWARDS_TX_SENT:
      return {
        ...state,
        txLoading: false,
        txError: null,
        tx: {
          ...(state.tx),
          receipt: null,
          hash: action.payload.hash
        }
      }
    case WITHDRAW_REWARDS_TX_RECEIPT:
      return {
        ...state,
        txLoading: false,
        txError: null,
        tx: {
          ...(state.tx),
          receipt: action.payload.receipt
        }
      }
    case WITHDRAW_REWARDS_TX_CONFIRMED:
      return {
        ...state,
        txLoading: false,
        txError: null
      }
    default:
      return state
  }
}

export default withdraw
